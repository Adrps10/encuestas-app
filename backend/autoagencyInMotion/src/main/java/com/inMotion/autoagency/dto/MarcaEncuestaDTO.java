package com.inMotion.autoagency.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarcaEncuestaDTO {
    private Long id;
    private String nombre;
    private List<PreguntaDTO> preguntas;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PreguntaDTO {
        private Long id;
        private String texto;
        private Integer orden;
        private Boolean obligatoria;
        private String tipo;
        private List<OpcionDTO> opciones;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OpcionDTO {
        private Long id;
        private String texto;
        private Integer valor;
    }
}