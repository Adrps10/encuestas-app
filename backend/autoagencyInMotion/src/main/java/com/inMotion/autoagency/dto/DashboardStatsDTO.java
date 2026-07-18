package com.inMotion.autoagency.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private Long marcaId;
    private String marcaNombre;
    private Long totalEncuestas;
    private Long respondidas;
    private Long pendientes;
    private Double promedioGeneral;
    private Map<String, Object> metricasPorPregunta;
    private List<RespuestaRecienteDTO> respuestasRecientes;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RespuestaRecienteDTO {
        private String clienteNombre;
        private String fechaRespuesta;
        private Integer calificacion;
        private String comentario;
    }
}