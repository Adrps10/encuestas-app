package com.inMotion.autoagency.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inMotion.autoagency.entity.Cliente;
import com.inMotion.autoagency.repository.ClienteRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ClienteService {
    
    private final ClienteRepository clienteRepository;
    
    @Transactional
    public Cliente obtenerOCrearCliente(String nombre, String apellido, String email, String telefono) {
        return clienteRepository.findByEmail(email)
                .orElseGet(() -> {
                    Cliente cliente = new Cliente();
                    cliente.setNombre(nombre);
                    cliente.setApellido(apellido);
                    cliente.setEmail(email);
                    cliente.setTelefono(telefono);
                    cliente.setFechaRegistro(LocalDateTime.now());
                    return clienteRepository.save(cliente);
                });
    }
}