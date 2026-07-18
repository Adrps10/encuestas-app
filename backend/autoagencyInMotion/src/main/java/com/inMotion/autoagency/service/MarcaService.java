package com.inMotion.autoagency.service;

import com.inMotion.autoagency.dto.MarcaEncuestaDTO;
import com.inMotion.autoagency.entity.Marca;
import com.inMotion.autoagency.entity.Opcion;
import com.inMotion.autoagency.entity.Pregunta;
import com.inMotion.autoagency.repository.MarcaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MarcaService {
    
    private final MarcaRepository marcaRepository;
    
    @Transactional(readOnly = true)
    public List<MarcaEncuestaDTO> obtenerMarcasConEncuestas() {
        List<Marca> marcas = marcaRepository.findByActivoTrueOrderByOrdenAsc();
        List<MarcaEncuestaDTO> result = new ArrayList<>();
        
        for (Marca marca : marcas) {
            result.add(convertirAMarcaEncuestaDTO(marca));
        }
        
        return result;
    }
    
    @Transactional(readOnly = true)
    public MarcaEncuestaDTO obtenerEncuestaPorMarca(Long marcaId) {
        Marca marca = marcaRepository.findById(marcaId)
                .orElseThrow(() -> new RuntimeException("Marca no encontrada"));
        return convertirAMarcaEncuestaDTO(marca);
    }
    
    private MarcaEncuestaDTO convertirAMarcaEncuestaDTO(Marca marca) {
        MarcaEncuestaDTO dto = new MarcaEncuestaDTO();
        dto.setId(marca.getId());
        dto.setNombre(marca.getNombre());
        
        List<MarcaEncuestaDTO.PreguntaDTO> preguntasDTO = new ArrayList<>();
        for (Pregunta pregunta : marca.getPreguntas()) {
            MarcaEncuestaDTO.PreguntaDTO p = new MarcaEncuestaDTO.PreguntaDTO();
            p.setId(pregunta.getId());
            p.setTexto(pregunta.getTexto());
            p.setOrden(pregunta.getOrden());
            p.setObligatoria(pregunta.getObligatoria());
            p.setTipo(pregunta.getTipo());
            
            List<MarcaEncuestaDTO.OpcionDTO> opcionesDTO = new ArrayList<>();
            for (Opcion opcion : pregunta.getOpciones()) {
                MarcaEncuestaDTO.OpcionDTO o = new MarcaEncuestaDTO.OpcionDTO();
                o.setId(opcion.getId());
                o.setTexto(opcion.getTexto());
                o.setValor(opcion.getValor());
                opcionesDTO.add(o);
            }
            p.setOpciones(opcionesDTO);
            preguntasDTO.add(p);
        }
        dto.setPreguntas(preguntasDTO);
        
        return dto;
    }
}