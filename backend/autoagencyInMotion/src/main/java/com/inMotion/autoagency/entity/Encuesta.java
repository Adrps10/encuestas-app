package com.inMotion.autoagency.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "encuestas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Encuesta {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 36)
    private String token;
    
    @Column(nullable = false)
    private String tipo; // VENTA, COMPRA, SERVICIO
    
    @Column(nullable = false)
    private String estado; // PENDIENTE, ENVIADA, RESPONDIDA, EXPIRADA
    
    private LocalDateTime fechaEnvio;
    
    private LocalDateTime fechaRespuesta;
    
    private LocalDateTime fechaExpiracion;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marca_id", nullable = false)
    private Marca marca;
    
    @OneToMany(mappedBy = "encuesta", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Respuesta> respuestas = new ArrayList<>();
}