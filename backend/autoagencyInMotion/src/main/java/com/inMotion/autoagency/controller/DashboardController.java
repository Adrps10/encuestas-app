package com.inMotion.autoagency.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.inMotion.autoagency.dto.DashboardStatsDTO;
import com.inMotion.autoagency.service.DashboardService;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    @GetMapping("/stats")
    public ResponseEntity<List<DashboardStatsDTO>> obtenerEstadisticas() {
        return ResponseEntity.ok(dashboardService.obtenerEstadisticasCompletas());
    }
    
    @GetMapping("/marca/{marcaId}")
    public ResponseEntity<DashboardStatsDTO> obtenerEstadisticasPorMarca(@PathVariable Long marcaId) {
        return ResponseEntity.ok(dashboardService.obtenerEstadisticasPorMarca(marcaId));
    }
}