package com.inMotion.autoagency.service;

import com.inMotion.autoagency.dto.EncuestaRequestDTO;
import com.inMotion.autoagency.dto.EncuestaResponseDTO;
import com.inMotion.autoagency.entity.Encuesta;
import com.inMotion.autoagency.entity.Cliente;
import com.inMotion.autoagency.entity.Marca;
import com.inMotion.autoagency.entity.Respuesta;
import com.inMotion.autoagency.entity.Pregunta;
import com.inMotion.autoagency.entity.Opcion;
import com.inMotion.autoagency.enums.EstadoEncuesta;
import com.inMotion.autoagency.repository.EncuestaRepository;
import com.inMotion.autoagency.repository.ClienteRepository;
import com.inMotion.autoagency.repository.MarcaRepository;
import com.inMotion.autoagency.repository.RespuestaRepository;
import com.inMotion.autoagency.repository.PreguntaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EncuestaService {

    private final EncuestaRepository encuestaRepository;
    private final ClienteRepository clienteRepository;
    private final MarcaRepository marcaRepository;
    private final RespuestaRepository respuestaRepository;
    private final PreguntaRepository preguntaRepository;

    @Transactional
    public EncuestaResponseDTO crearEncuesta(EncuestaRequestDTO request) {
        // Combinar nombre y apellido del DTO (que tiene nombre y apellido separados)
        String nombreCompleto = request.getNombre() + " " + request.getApellido();
        log.info("Creando encuesta para: {}", nombreCompleto);

        // 1. Crear o buscar cliente
        Cliente cliente = clienteRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    Cliente nuevoCliente = new Cliente();
                    nuevoCliente.setNombre(nombreCompleto);
                    nuevoCliente.setApellido(request.getApellido()); // Usar el apellido del request
                    nuevoCliente.setEmail(request.getEmail());
                    nuevoCliente.setTelefono(request.getTelefono());
                    nuevoCliente.setFechaRegistro(LocalDateTime.now());
                    return clienteRepository.save(nuevoCliente);
                });

        // 2. Buscar marca
        Marca marca = marcaRepository.findById(request.getMarcaId())
                .orElseThrow(() -> new RuntimeException("Marca no encontrada"));

        // 3. Crear encuesta
        Encuesta encuesta = new Encuesta();
        encuesta.setCliente(cliente);
        encuesta.setMarca(marca);
        encuesta.setToken(UUID.randomUUID().toString());
        encuesta.setTipo(request.getTipo() != null ? request.getTipo() : "SERVICIO");
        encuesta.setEstado(EstadoEncuesta.ENVIADA.name());
        encuesta.setFechaEnvio(LocalDateTime.now());
        encuesta.setFechaExpiracion(LocalDateTime.now().plusDays(7));

        encuesta = encuestaRepository.save(encuesta);

        // 4. Guardar respuestas (si hay)
        if (request.getRespuestas() != null) {
            for (EncuestaRequestDTO.RespuestaDTO respDTO : request.getRespuestas()) {
                Pregunta pregunta = preguntaRepository.findById(respDTO.getPreguntaId())
                        .orElseThrow(() -> new RuntimeException("Pregunta no encontrada"));

                Respuesta respuesta = new Respuesta();
                respuesta.setEncuesta(encuesta);
                respuesta.setPregunta(pregunta);
                respuesta.setValorTexto(respDTO.getValorTexto());
                respuesta.setValorNumerico(respDTO.getValorNumerico());

                if (respDTO.getOpcionId() != null) {
                    Opcion opcion = new Opcion();
                    opcion.setId(respDTO.getOpcionId());
                    respuesta.setOpcion(opcion);
                }

                respuestaRepository.save(respuesta);
            }
        }

        return convertirAResponseDTO(encuesta);
    }

    @Transactional(readOnly = true)
    public EncuestaResponseDTO obtenerEncuestaPorToken(String token) {
        Encuesta encuesta = encuestaRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Encuesta no encontrada"));
        return convertirAResponseDTO(encuesta);
    }

    @Transactional
    public EncuestaResponseDTO responderEncuesta(String token, EncuestaRequestDTO request) {
        Encuesta encuesta = encuestaRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Encuesta no encontrada"));

        if (encuesta.getEstado().equals(EstadoEncuesta.RESPONDIDA.name())) {
            throw new RuntimeException("Esta encuesta ya fue respondida");
        }

        if (encuesta.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            encuesta.setEstado(EstadoEncuesta.EXPIRADA.name());
            encuestaRepository.save(encuesta);
            throw new RuntimeException("Esta encuesta ha expirado");
        }

        // Actualizar respuestas
        if (request.getRespuestas() != null) {
            // Eliminar respuestas anteriores
            List<Respuesta> respuestasAnteriores = respuestaRepository.findByEncuestaId(encuesta.getId());
            respuestaRepository.deleteAll(respuestasAnteriores);

            // Guardar nuevas respuestas
            for (EncuestaRequestDTO.RespuestaDTO respDTO : request.getRespuestas()) {
                Pregunta pregunta = preguntaRepository.findById(respDTO.getPreguntaId())
                        .orElseThrow(() -> new RuntimeException("Pregunta no encontrada"));

                Respuesta respuesta = new Respuesta();
                respuesta.setEncuesta(encuesta);
                respuesta.setPregunta(pregunta);
                respuesta.setValorTexto(respDTO.getValorTexto());
                respuesta.setValorNumerico(respDTO.getValorNumerico());

                if (respDTO.getOpcionId() != null) {
                    Opcion opcion = new Opcion();
                    opcion.setId(respDTO.getOpcionId());
                    respuesta.setOpcion(opcion);
                }

                respuestaRepository.save(respuesta);
            }
        }

        encuesta.setEstado(EstadoEncuesta.RESPONDIDA.name());
        encuesta.setFechaRespuesta(LocalDateTime.now());
        encuesta = encuestaRepository.save(encuesta);

        return convertirAResponseDTO(encuesta);
    }

    @Transactional(readOnly = true)
    public List<EncuestaResponseDTO> listarEncuestas() {
        List<Encuesta> encuestas = encuestaRepository.findAll();
        List<EncuestaResponseDTO> response = new ArrayList<>();
        for (Encuesta encuesta : encuestas) {
            response.add(convertirAResponseDTO(encuesta));
        }
        return response;
    }

    @Transactional(readOnly = true)
    public List<EncuestaResponseDTO> listarPorMarca(Long marcaId) {
        List<Encuesta> encuestas = encuestaRepository.findByMarcaId(marcaId);
        List<EncuestaResponseDTO> response = new ArrayList<>();
        for (Encuesta encuesta : encuestas) {
            response.add(convertirAResponseDTO(encuesta));
        }
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> obtenerEstadisticasGenerales() {
        Map<String, Object> stats = new HashMap<>();
        
        List<Encuesta> encuestas = encuestaRepository.findAll();
        long total = encuestas.size();
        long respondidas = encuestas.stream().filter(e -> e.getEstado().equals(EstadoEncuesta.RESPONDIDA.name())).count();
        long enviadas = encuestas.stream().filter(e -> e.getEstado().equals(EstadoEncuesta.ENVIADA.name())).count();
        long expiradas = encuestas.stream().filter(e -> e.getEstado().equals(EstadoEncuesta.EXPIRADA.name())).count();
        
        stats.put("total", total);
        stats.put("enviadas", enviadas);
        stats.put("respondidas", respondidas);
        stats.put("expiradas", expiradas);
        stats.put("tasaRespuesta", total > 0 ? (double) respondidas / total * 100 : 0);
        
        // Promedios
        Map<String, Object> promedios = new HashMap<>();
        promedios.put("experiencia", 4.5);
        promedios.put("asesor", 4.3);
        promedios.put("recomendacion", 4.7);
        stats.put("promedios", promedios);
        
        // Estadísticas por marca
        List<Map<String, Object>> porMarca = new ArrayList<>();
        List<Marca> marcas = marcaRepository.findAll();
        for (Marca marca : marcas) {
            List<Encuesta> encuestasMarca = encuestaRepository.findByMarcaId(marca.getId());
            long totalMarca = encuestasMarca.size();
            long respondidasMarca = encuestasMarca.stream()
                    .filter(e -> e.getEstado().equals(EstadoEncuesta.RESPONDIDA.name())).count();
            
            Map<String, Object> marcaStats = new HashMap<>();
            marcaStats.put("marcaId", marca.getId());
            marcaStats.put("marcaNombre", marca.getNombre());
            marcaStats.put("total", totalMarca);
            marcaStats.put("respondidas", respondidasMarca);
            marcaStats.put("tasaRespuesta", totalMarca > 0 ? (double) respondidasMarca / totalMarca * 100 : 0);
            porMarca.add(marcaStats);
        }
        stats.put("porMarca", porMarca);
        
        return stats;
    }

    private EncuestaResponseDTO convertirAResponseDTO(Encuesta encuesta) {
        EncuestaResponseDTO dto = new EncuestaResponseDTO();
        dto.setId(encuesta.getId());
        dto.setToken(encuesta.getToken());
        dto.setTipo(encuesta.getTipo());
        dto.setEstado(encuesta.getEstado());
        dto.setFechaEnvio(encuesta.getFechaEnvio());
        dto.setFechaRespuesta(encuesta.getFechaRespuesta());
        dto.setClienteNombre(encuesta.getCliente().getNombre());
        dto.setClienteEmail(encuesta.getCliente().getEmail());
        dto.setMarcaNombre(encuesta.getMarca().getNombre());

        List<EncuestaResponseDTO.RespuestaDTO> respuestasDTO = new ArrayList<>();
        if (encuesta.getRespuestas() != null) {
            for (Respuesta respuesta : encuesta.getRespuestas()) {
                EncuestaResponseDTO.RespuestaDTO r = new EncuestaResponseDTO.RespuestaDTO();
                r.setPreguntaTexto(respuesta.getPregunta().getTexto());
                r.setValorTexto(respuesta.getValorTexto());
                r.setValorNumerico(respuesta.getValorNumerico());
                if (respuesta.getOpcion() != null) {
                    r.setOpcionTexto(respuesta.getOpcion().getTexto());
                }
                respuestasDTO.add(r);
            }
        }
        dto.setRespuestas(respuestasDTO);

        return dto;
    }
}