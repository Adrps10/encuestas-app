package com.inMotion.autoagency.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inMotion.autoagency.dto.DashboardStatsDTO;
import com.inMotion.autoagency.dto.EncuestaRequestDTO;
import com.inMotion.autoagency.dto.EncuestaResponseDTO;
import com.inMotion.autoagency.service.DashboardService;
import com.inMotion.autoagency.service.EncuestaService;

@RestController
@RequestMapping("/api/encuestas")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
public class EncuestaController {

    private final EncuestaService encuestaService;
    private final DashboardService dashboardService;

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Backend funcionando correctamente en puerto 8086");
    }

    @PostMapping("/crear")
    public ResponseEntity<EncuestaResponseDTO> crearEncuesta(@Valid @RequestBody EncuestaRequestDTO request) {
        EncuestaResponseDTO response = encuestaService.crearEncuesta(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/token/{token}")
    public ResponseEntity<EncuestaResponseDTO> obtenerEncuestaPorToken(@PathVariable String token) {
        EncuestaResponseDTO response = encuestaService.obtenerEncuestaPorToken(token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/responder/{token}")
    public ResponseEntity<EncuestaResponseDTO> responderEncuesta(
            @PathVariable String token,
            @Valid @RequestBody EncuestaRequestDTO request) {
        EncuestaResponseDTO response = encuestaService.responderEncuesta(token, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/listar")
    public ResponseEntity<List<EncuestaResponseDTO>> listarEncuestas() {
        List<EncuestaResponseDTO> encuestas = encuestaService.listarEncuestas();
        return ResponseEntity.ok(encuestas);
    }

    @GetMapping("/marca/{marcaId}")
    public ResponseEntity<List<EncuestaResponseDTO>> listarPorMarca(@PathVariable Long marcaId) {
        List<EncuestaResponseDTO> encuestas = encuestaService.listarPorMarca(marcaId);
        return ResponseEntity.ok(encuestas);
    }

    @GetMapping("/estadisticas/generales")
    public ResponseEntity<?> obtenerEstadisticasGenerales() {
        return ResponseEntity.ok(encuestaService.obtenerEstadisticasGenerales());
    }

    @GetMapping("/dashboard/completo")
    public ResponseEntity<List<DashboardStatsDTO>> obtenerEstadisticasCompletas() {
        List<DashboardStatsDTO> stats = dashboardService.obtenerEstadisticasCompletas();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/dashboard/marca/{marcaId}")
    public ResponseEntity<DashboardStatsDTO> obtenerEstadisticasPorMarca(@PathVariable Long marcaId) {
        DashboardStatsDTO stats = dashboardService.obtenerEstadisticasPorMarca(marcaId);
        return ResponseEntity.ok(stats);
    }
}