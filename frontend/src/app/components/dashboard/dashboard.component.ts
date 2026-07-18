import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EncuestaService } from '../../services/encuesta.service';
import { Encuesta, EstadisticasGenerales } from '../../models/encuesta.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  encuestas: Encuesta[] = [];
  encuestasRecientes: Encuesta[] = [];  // ✅ Nuevo array para las últimas 10
  marcas: any[] = [];
  estadisticas: EstadisticasGenerales = {
    total: 0,
    enviadas: 0,
    respondidas: 0,
    expiradas: 0,
    tasaRespuesta: 0,
    promedios: {
      experiencia: 0,
      asesor: 0,
      recomendacion: 0
    },
    porMarca: []
  };
  
  loading = true;
  error = '';
  encuestaSeleccionada: Encuesta | null = null;
  mostrarDetalles = false;

  logos: { [key: number]: string } = {
    1: 'Toyota.png',
    2: 'carsline-pachuca.png',
    3: 'carsline-pachuca.png',
    4: 'gwm.png',
    5: 'subaru.webp',
    6: 'comprocars-queretaro.png',
    7: 'comprocars-queretaro.png'
  };

  constructor(
    private encuestaService: EncuestaService,
    private router: Router
  ) {
    this.marcas = this.encuestaService.obtenerMarcas();
  }

  ngOnInit() {
    this.cargarDatos();
  }

  obtenerLogo(marcaId: number): string {
    return this.logos[marcaId] || 'default.svg';
  }

  getEstadoClass(estado: string): string {
    const classes = {
      'ENVIADA': 'badge-enviada',
      'RESPONDIDA': 'badge-respondida',
      'EXPIRADA': 'badge-expirada'
    };
    return classes[estado as keyof typeof classes] || '';
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

  cargarDatos() {
    this.loading = true;
    this.encuestaService.listarEncuestas().subscribe({
      next: (data: Encuesta[]) => {
        this.encuestas = data;
        
        // Ordenar por fecha de envío (más reciente primero) y tomar las últimas 10
        this.encuestasRecientes = [...this.encuestas]
          .sort((a, b) => {
            const fechaA = new Date(a.fechaEnvio).getTime();
            const fechaB = new Date(b.fechaEnvio).getTime();
            return fechaB - fechaA; // Descendente (más reciente primero)
          })
          .slice(0, 10); // Tomar solo las 10 primeras
        
        this.cargarEstadisticas();
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Error al cargar las encuestas';
        this.loading = false;
        console.error(error);
      }
    });
  }

  cargarEstadisticas() {
    this.encuestaService.obtenerEstadisticasGenerales().subscribe({
      next: (data: EstadisticasGenerales) => {
        this.estadisticas = data;
      },
      error: (error: any) => {
        console.error('Error al cargar estadisticas:', error);
      }
    });
  }

  getEncuestasPorMarca(marcaId: number): Encuesta[] {
    const marcaNombre = this.obtenerMarcaNombre(marcaId);
    if (!marcaNombre) return [];
    return this.encuestas.filter(e => e.marcaNombre === marcaNombre);
  }

  obtenerMarcaNombre(marcaId: number): string {
    const marca = this.marcas.find(m => m.id === marcaId);
    return marca ? marca.nombre : '';
  }

  getTotalPorMarca(marcaId: number): number {
    return this.getEncuestasPorMarca(marcaId).length;
  }

  getRespondidasPorMarca(marcaId: number): number {
    return this.getEncuestasPorMarca(marcaId)
      .filter(e => e.estado === 'RESPONDIDA').length;
  }

  getPendientesPorMarca(marcaId: number): number {
    return this.getEncuestasPorMarca(marcaId)
      .filter(e => e.estado === 'ENVIADA').length;
  }

  getTasaPorMarca(marcaId: number): number {
    const total = this.getTotalPorMarca(marcaId);
    const respondidas = this.getRespondidasPorMarca(marcaId);
    return total > 0 ? (respondidas / total) * 100 : 0;
  }

  getPromedioPorMarca(marcaId: number): number {
    const encuestas = this.getEncuestasPorMarca(marcaId)
      .filter(e => e.estado === 'RESPONDIDA');
    
    if (encuestas.length === 0) return 0;
    
    let total = 0;
    let count = 0;
    for (const encuesta of encuestas) {
      for (const respuesta of encuesta.respuestas || []) {
        if (respuesta.valorNumerico) {
          total += respuesta.valorNumerico;
          count++;
        }
      }
    }
    
    return count > 0 ? total / count : 0;
  }

  getPromedioEncuesta(encuesta: Encuesta): number {
    if (!encuesta.respuestas || encuesta.respuestas.length === 0) return 0;
    
    let total = 0;
    let count = 0;
    for (const respuesta of encuesta.respuestas) {
      if (respuesta.valorNumerico) {
        total += respuesta.valorNumerico;
        count++;
      }
    }
    
    return count > 0 ? total / count : 0;
  }

  getEstadoTexto(estado: string): string {
    const textos = {
      'ENVIADA': 'Enviada',
      'RESPONDIDA': 'Respondida',
      'EXPIRADA': 'Expirada'
    };
    return textos[estado as keyof typeof textos] || estado;
  }

  generarLink(token: string): string {
    return this.encuestaService.generarLinkEncuesta(token);
  }

  copiarLink(token: string) {
    const link = this.generarLink(token);
    navigator.clipboard.writeText(link);
    alert('Link copiado al portapapeles: ' + link);
  }

  verDetalles(encuesta: Encuesta) {
    this.encuestaSeleccionada = encuesta;
    this.mostrarDetalles = true;
  }

  cerrarDetalles() {
    this.mostrarDetalles = false;
    this.encuestaSeleccionada = null;
  }

  refrescarDatos() {
    this.cargarDatos();
  }
}