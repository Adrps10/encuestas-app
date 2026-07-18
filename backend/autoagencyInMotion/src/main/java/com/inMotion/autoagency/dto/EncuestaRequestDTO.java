package com.inMotion.autoagency.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EncuestaRequestDTO {
    
    @NotNull(message = "El ID de la marca es obligatorio")
    private Long marcaId;
    
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;
    
    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;
    
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Email inválido")
    private String email;
    
    private String telefono;
    
    private String tipo; // VENTA, COMPRA, SERVICIO
    
    private List<RespuestaDTO> respuestas;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RespuestaDTO {
        private Long preguntaId;
        private String valorTexto;
        private Integer valorNumerico;
        private Long opcionId;
    }
}