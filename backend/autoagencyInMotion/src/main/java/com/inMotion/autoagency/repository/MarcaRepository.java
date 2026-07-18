package com.inMotion.autoagency.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.inMotion.autoagency.entity.Marca;

import java.util.List;

@Repository
public interface MarcaRepository extends JpaRepository<Marca, Long> {
    List<Marca> findByActivoTrueOrderByOrdenAsc();
}