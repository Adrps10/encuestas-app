package com.inMotion.autoagency.repository;

import com.inMotion.autoagency.entity.Encuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EncuestaRepository extends JpaRepository<Encuesta, Long> {
    
    Optional<Encuesta> findByToken(String token);
    
    List<Encuesta> findByEstado(String estado);
    
    List<Encuesta> findByEstadoAndFechaEnvioBefore(String estado, LocalDateTime fecha);
    
    List<Encuesta> findByMarcaId(Long marcaId);
    
    List<Encuesta> findByMarcaIdAndEstadoOrderByFechaEnvioDesc(Long marcaId, String estado);
    
    long countByMarcaIdAndEstado(Long marcaId, String estado);
}