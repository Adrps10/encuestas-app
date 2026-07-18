package com.inMotion.autoagency.repository;

import com.inMotion.autoagency.entity.Respuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RespuestaRepository extends JpaRepository<Respuesta, Long> {
    
    List<Respuesta> findByEncuestaId(Long encuestaId);
}