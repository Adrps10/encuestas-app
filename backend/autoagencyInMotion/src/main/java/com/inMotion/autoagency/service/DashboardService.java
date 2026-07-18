package com.inMotion.autoagency.service;

import com.inMotion.autoagency.dto.DashboardStatsDTO;
import com.inMotion.autoagency.entity.Encuesta;
import com.inMotion.autoagency.entity.Marca;
import com.inMotion.autoagency.entity.Respuesta;
import com.inMotion.autoagency.enums.EstadoEncuesta;
import com.inMotion.autoagency.repository.EncuestaRepository;
import com.inMotion.autoagency.repository.MarcaRepository;
import com.inMotion.autoagency.repository.RespuestaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {
    
    private final MarcaRepository marcaRepository;
    private final EncuestaRepository encuestaRepository;
    private final RespuestaRepository respuestaRepository;
    
    @Transactional(readOnly = true)
    public List<DashboardStatsDTO> obtenerEstadisticasCompletas() {
        List<Marca> marcas = marcaRepository.findAll();
        List<DashboardStatsDTO> result = new ArrayList<>();
        
        for (Marca marca : marcas) {
            result.add(obtenerEstadisticasPorMarca(marca.getId()));
        }
        
        return result;
    }
    
    @Transactional(readOnly = true)
    public DashboardStatsDTO obtenerEstadisticasPorMarca(Long marcaId) {
        Marca marca = marcaRepository.findById(marcaId)
                .orElseThrow(() -> new RuntimeException("Marca no encontrada"));
        
        DashboardStatsDTO dto = new DashboardStatsDTO();
        dto.setMarcaId(marca.getId());
        dto.setMarcaNombre(marca.getNombre());
        
        // Obtener todas las encuestas de la marca
        List<Encuesta> encuestasMarca = encuestaRepository.findByMarcaId(marcaId);
        
        long total = encuestasMarca.size();
        long respondidas = 0;
        long pendientes = 0;
        
        // Calcular respondidas y pendientes manualmente
        for (Encuesta encuesta : encuestasMarca) {
            if (EstadoEncuesta.RESPONDIDA.name().equals(encuesta.getEstado())) {
                respondidas++;
            } else if (EstadoEncuesta.ENVIADA.name().equals(encuesta.getEstado())) {
                pendientes++;
            }
        }
        
        dto.setTotalEncuestas(total);
        dto.setRespondidas(respondidas);
        dto.setPendientes(pendientes);
        
        // Calcular calificaciones y comentarios
        Map<String, Object> metricas = new LinkedHashMap<>();
        double sumaCalificaciones = 0;
        int countCalificaciones = 0;
        
        // Respuestas recientes
        List<DashboardStatsDTO.RespuestaRecienteDTO> recientes = new ArrayList<>();
        
        for (Encuesta encuesta : encuestasMarca) {
            if (EstadoEncuesta.RESPONDIDA.name().equals(encuesta.getEstado())) {
                // Obtener respuestas
                List<Respuesta> respuestas = respuestaRepository.findByEncuestaId(encuesta.getId());
                
                Integer calificacion = null;
                String comentario = null;
                
                for (Respuesta respuesta : respuestas) {
                    if (respuesta.getValorNumerico() != null) {
                        calificacion = respuesta.getValorNumerico();
                        sumaCalificaciones += calificacion;
                        countCalificaciones++;
                    }
                    if (respuesta.getValorTexto() != null && !respuesta.getValorTexto().isEmpty()) {
                        comentario = respuesta.getValorTexto();
                    }
                }
                
                // Agregar a respuestas recientes
                if (calificacion != null) {
                    DashboardStatsDTO.RespuestaRecienteDTO reciente = new DashboardStatsDTO.RespuestaRecienteDTO();
                    reciente.setClienteNombre(encuesta.getCliente().getNombre());
                    reciente.setFechaRespuesta(encuesta.getFechaRespuesta() != null ? 
                            encuesta.getFechaRespuesta().toString() : null);
                    reciente.setCalificacion(calificacion);
                    reciente.setComentario(comentario);
                    recientes.add(reciente);
                }
            }
        }
        
        // Ordenar recientes por fecha (más reciente primero)
        recientes.sort((a, b) -> {
            if (a.getFechaRespuesta() == null) return 1;
            if (b.getFechaRespuesta() == null) return -1;
            return b.getFechaRespuesta().compareTo(a.getFechaRespuesta());
        });
        
        // Limitar a 5
        if (recientes.size() > 5) {
            recientes = recientes.subList(0, 5);
        }
        dto.setRespuestasRecientes(recientes);
        
        // Calcular promedio general
        double promedio = countCalificaciones > 0 ? sumaCalificaciones / countCalificaciones : 0;
        dto.setPromedioGeneral(Math.round(promedio * 10.0) / 10.0);
        
        // Agregar métricas
        metricas.put("Calificacion promedio", dto.getPromedioGeneral());
        metricas.put("Total de respuestas", countCalificaciones);
        dto.setMetricasPorPregunta(metricas);
        
        return dto;
    }
}