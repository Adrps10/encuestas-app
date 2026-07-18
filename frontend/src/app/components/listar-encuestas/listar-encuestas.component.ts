import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EncuestaService } from '../../services/encuesta.service';
import { Encuesta } from '../../models/encuesta.model';

@Component({
  selector: 'app-listar-encuestas',
  templateUrl: './listar-encuestas.component.html',
  styleUrls: ['./listar-encuestas.component.css']
})
export class ListarEncuestasComponent implements OnInit {
  encuestas: Encuesta[] = [];
  encuestasFiltradas: Encuesta[] = [];
  marcas: any[] = [];
  loading: boolean = true;
  error: string = '';

  filtroTexto: string = '';
  filtroMarca: string = '';
  filtroEstado: string = '';

  mostrarDetalles: boolean = false;
  encuestaSeleccionada: Encuesta | null = null;

  constructor(
    private encuestaService: EncuestaService,
    private router: Router
  ) {
    this.marcas = this.encuestaService.obtenerMarcas();
  }

  ngOnInit() {
    this.cargarEncuestas();
  }

  cargarEncuestas() {
    this.loading = true;
    this.encuestaService.listarEncuestas().subscribe({
      next: (data: Encuesta[]) => {
        this.encuestas = data;
        this.encuestasFiltradas = data;
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Error al cargar las encuestas';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  filtrarEncuestas() {
    this.encuestasFiltradas = this.encuestas.filter(encuesta => {
      const textoMatch = this.filtroTexto === '' ||
        encuesta.clienteNombre.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        encuesta.clienteEmail.toLowerCase().includes(this.filtroTexto.toLowerCase());

      const marcaMatch = this.filtroMarca === '' ||
        encuesta.marcaNombre === this.filtroMarca;

      const estadoMatch = this.filtroEstado === '' ||
        encuesta.estado === this.filtroEstado;

      return textoMatch && marcaMatch && estadoMatch;
    });
  }

  limpiarFiltros() {
    this.filtroTexto = '';
    this.filtroMarca = '';
    this.filtroEstado = '';
    this.encuestasFiltradas = this.encuestas;
  }

  getEstadoClass(estado: string): string {
    const classes = {
      'ENVIADA': 'badge-enviada',
      'RESPONDIDA': 'badge-respondida',
      'EXPIRADA': 'badge-expirada'
    };
    return classes[estado as keyof typeof classes] || '';
  }

  getEstadoTexto(estado: string): string {
    const textos = {
      'ENVIADA': 'Enviada',
      'RESPONDIDA': 'Respondida',
      'EXPIRADA': 'Expirada'
    };
    return textos[estado as keyof typeof textos] || estado;
  }

  formatFecha(fecha: Date | string): string {
    if (!fecha) return '-';
    const d = new Date(fecha);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    const horas = String(d.getHours()).padStart(2, '0');
    const minutos = String(d.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
  }

  generarLink(token: string): string {
    return this.encuestaService.generarLinkEncuesta(token);
  }

  copiarLink(token: string, clienteNombre: string) {
    const link = this.generarLink(token);
    navigator.clipboard.writeText(link).then(() => {
      alert('Link copiado al portapapeles para ' + clienteNombre + '\n\n' + link);
    }).catch(() => {
      prompt('Copia el link para ' + clienteNombre + ':', link);
    });
  }

  verDetalles(encuesta: Encuesta) {
    this.encuestaSeleccionada = encuesta;
    this.mostrarDetalles = true;
  }

  cerrarDetalles() {
    this.mostrarDetalles = false;
    this.encuestaSeleccionada = null;
  }
}