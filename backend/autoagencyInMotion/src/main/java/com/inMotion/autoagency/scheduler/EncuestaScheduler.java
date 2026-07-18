package com.inMotion.autoagency.scheduler;

import com.inMotion.autoagency.entity.Encuesta;
import com.inMotion.autoagency.enums.EstadoEncuesta;
import com.inMotion.autoagency.repository.EncuestaRepository;
import com.inMotion.autoagency.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class EncuestaScheduler {
    
    private final EncuestaRepository encuestaRepository;
    private final EmailService emailService;
    
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void actualizarEncuestasExpiradas() {
        log.info("Ejecutando scheduler para actualizar encuestas expiradas");
        
        LocalDateTime ahora = LocalDateTime.now();
        List<Encuesta> encuestasActivas = encuestaRepository.findByEstado(EstadoEncuesta.ENVIADA.name());
        
        int expiradas = 0;
        for (Encuesta encuesta : encuestasActivas) {
            if (encuesta.getFechaExpiracion().isBefore(ahora)) {
                encuesta.setEstado(EstadoEncuesta.EXPIRADA.name());
                encuestaRepository.save(encuesta);
                expiradas++;
                log.debug("Encuesta {} expirada", encuesta.getToken());
            }
        }
        
        log.info("Scheduler finalizado. {} encuestas expiradas", expiradas);
    }
    
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional
    public void enviarRecordatorios() {
        log.info("Ejecutando scheduler de recordatorios de encuestas");
        
        try {
            LocalDateTime ahora = LocalDateTime.now();
            LocalDateTime hace2Dias = ahora.minusDays(2);
            
            List<Encuesta> encuestasPendientes = encuestaRepository
                    .findByEstadoAndFechaEnvioBefore(EstadoEncuesta.ENVIADA.name(), hace2Dias);
            
            int recordatorios = 0;
            for (Encuesta encuesta : encuestasPendientes) {
                if (encuesta.getFechaExpiracion().isAfter(ahora)) {
                    try {
                        emailService.enviarRecordatorioEncuesta(encuesta);
                        recordatorios++;
                        log.info("Recordatorio procesado para encuesta: {}", encuesta.getToken());
                    } catch (Exception e) {
                        log.error("Error procesando recordatorio para encuesta {}: {}", encuesta.getToken(), e.getMessage());
                    }
                }
            }
            
            log.info("Scheduler de recordatorios finalizado. {} recordatorios procesados", recordatorios);
        } catch (Exception e) {
            log.error("Error en scheduler de recordatorios: {}", e.getMessage());
        }
    }
}