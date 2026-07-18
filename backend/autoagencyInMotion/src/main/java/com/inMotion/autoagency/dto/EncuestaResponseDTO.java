package com.inMotion.autoagency.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EncuestaResponseDTO {
    private Long id;
    private String token;
    private String tipo;
    private String estado;
    private LocalDateTime fechaEnvio;
    private LocalDateTime fechaRespuesta;
    private String clienteNombre;
    private String clienteEmail;
    private String marcaNombre;
    private List<RespuestaDTO> respuestas;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RespuestaDTO {
        private String preguntaTexto;
        private String valorTexto;
        private Integer valorNumerico;
        private String opcionTexto;
    }
}