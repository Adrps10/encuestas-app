package com.inMotion.autoagency.service;

import com.inMotion.autoagency.entity.Encuesta;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {
    
    /**
     * Envía una encuesta al cliente (simulado)
     */
    public void enviarEncuesta(Encuesta encuesta) {
        log.info("📧 [SIMULADO] Enviando encuesta a: {}", encuesta.getCliente().getEmail());
        log.info("   Token: {}", encuesta.getToken());
        log.info("   Cliente: {} {}", encuesta.getCliente().getNombre(), encuesta.getCliente().getApellido());
        log.info("   Marca: {}", encuesta.getMarca().getNombre());
        log.info("   ✅ Encuesta enviada correctamente (simulado)");
    }
    
    /**
     * Envía un recordatorio de encuesta (simulado)
     */
    public void enviarRecordatorioEncuesta(Encuesta encuesta) {
        log.info("📧 [SIMULADO] Enviando recordatorio a: {}", encuesta.getCliente().getEmail());
        log.info("   Token: {}", encuesta.getToken());
        log.info("   Cliente: {} {}", encuesta.getCliente().getNombre(), encuesta.getCliente().getApellido());
        log.info("   ✅ Recordatorio enviado correctamente (simulado)");
    }
}