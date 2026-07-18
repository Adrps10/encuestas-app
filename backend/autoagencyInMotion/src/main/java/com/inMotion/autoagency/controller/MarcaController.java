package com.inMotion.autoagency.controller;

import com.inMotion.autoagency.dto.MarcaEncuestaDTO;
import com.inMotion.autoagency.service.MarcaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marcas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MarcaController {
    
    private final MarcaService marcaService;
    
    @GetMapping
    public ResponseEntity<List<MarcaEncuestaDTO>> obtenerMarcas() {
        return ResponseEntity.ok(marcaService.obtenerMarcasConEncuestas());
    }
    
    @GetMapping("/{marcaId}")
    public ResponseEntity<MarcaEncuestaDTO> obtenerMarcaPorId(@PathVariable Long marcaId) {
        return ResponseEntity.ok(marcaService.obtenerEncuestaPorMarca(marcaId));
    }
}