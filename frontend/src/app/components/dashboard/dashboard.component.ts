import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EncuestaService } from '../../services/encuesta.service';
import { Encuesta, EstadisticasGenerales } from '../../models/encuesta.model';
import { NotificationService } from '../../services/notification.service';
import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('graficoMarcas') graficoCanvas!: ElementRef;
  @ViewChild('graficoEvolucion') evolucionCanvas!: ElementRef;
  
  encuestas: Encuesta[] = [];
  encuestasRecientes: Encuesta[] = [];
  encuestasFiltradas: Encuesta[] = [];
  marcas: any[] = [];
  marcasFiltradas: any[] = [];
  
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
  copiando = false;
  periodo: 'hoy' | 'semana' | 'mes' | 'todos' = 'todos';
  graficosInicializados = false;

  logos: { [key: number]: string } = {
    1: 'Toyota.png',
    2: 'carsline.png',
    3: 'carsline.png',
    4: 'gwm.png',
    5: 'subaru.webp',
    6: 'comprocars.png',
    7: 'comprocars.png'
  };

  private grafico: Chart | null = null;
  private graficoEvolucion: Chart | null = null;

  constructor(
    private encuestaService: EncuestaService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.cargarDatosCompletos();
    
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        this.refrescarDatos();
      }
    });
  }

  ngAfterViewInit() {
    this.graficosInicializados = true;
    setTimeout(() => {
      if (this.marcas.length > 0) {
        this.crearGraficoMarcas();
        this.crearGraficoEvolucion();
      }
    }, 600);
  }

  normalizarTexto(texto: string): string {
    if (!texto) return '';
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  cargarDatosCompletos() {
    this.loading = true;
    
    const cacheKey = 'dashboard_stats';
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTime = localStorage.getItem(cacheKey + '_time');
    
    if (cachedData && cacheTime) {
      const tiempoTranscurrido = Date.now() - parseInt(cacheTime);
      if (tiempoTranscurrido < 300000) {
        const data = JSON.parse(cachedData);
        this.procesarDatos(data);
        this.loading = false;
        return;
      }
    }
    
    this.cargarDesdeBackend();
  }

  cargarDesdeBackend() {
    this.encuestaService.obtenerEstadisticasGenerales().subscribe({
      next: (data: any) => {
        this.guardarEnCache(data);
        this.procesarDatos(data);
        
        this.encuestaService.listarEncuestas().subscribe({
          next: (encuestasData: Encuesta[]) => {
            this.encuestas = encuestasData || [];
            this.encuestasFiltradas = [...this.encuestas];
            this.aplicarFiltroPeriodo();
            this.loading = false;
            
            if (this.graficosInicializados) {
              setTimeout(() => {
                this.crearGraficoMarcas();
                this.crearGraficoEvolucion();
              }, 300);
            }
          },
          error: (error) => {
            console.error('Error al cargar encuestas:', error);
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar estadisticas:', error);
        this.loading = false;
      }
    });
  }

  guardarEnCache(data: any) {
    const cacheKey = 'dashboard_stats';
    localStorage.setItem(cacheKey, JSON.stringify(data));
    localStorage.setItem(cacheKey + '_time', Date.now().toString());
  }

  procesarDatos(data: any) {
    this.estadisticas = {
      total: data.total || 0,
      enviadas: data.enviadas || 0,
      respondidas: data.respondidas || 0,
      expiradas: data.expiradas || 0,
      tasaRespuesta: data.tasaRespuesta || 0,
      promedios: data.promedios || { experiencia: 0, asesor: 0, recomendacion: 0 },
      porMarca: data.porMarca || []
    };
    
    this.procesarMarcas(data.porMarca);
    
    if (this.graficosInicializados) {
      setTimeout(() => {
        this.crearGraficoMarcas();
        this.crearGraficoEvolucion();
      }, 300);
    }
  }

  procesarMarcas(porMarca: any[]) {
    const marcasMap = new Map();
    
    porMarca.forEach((item: any) => {
      let nombreOriginal = item.marcaNombre.trim();
      
      if (nombreOriginal === 'Compro Pachuca') {
        nombreOriginal = 'Comprocars Pachuca';
      }
      
      const nombreKey = this.normalizarTexto(nombreOriginal);
      
      if (!marcasMap.has(nombreKey)) {
        marcasMap.set(nombreKey, {
          id: item.marcaId,
          nombre: nombreOriginal,
          total: item.total || 0,
          respondidas: item.respondidas || 0,
          pendientes: item.enviadas || 0,
          promedio: item.promedio || 0,
          tasaRespuesta: item.tasaRespuesta || 0,
          nombreKey: nombreKey
        });
      } else {
        const existing = marcasMap.get(nombreKey);
        if (item.total > existing.total) {
          marcasMap.set(nombreKey, {
            id: item.marcaId,
            nombre: nombreOriginal,
            total: item.total || 0,
            respondidas: item.respondidas || 0,
            pendientes: item.enviadas || 0,
            promedio: item.promedio || 0,
            tasaRespuesta: item.tasaRespuesta || 0,
            nombreKey: nombreKey
          });
        }
      }
    });
    
    this.marcas = Array.from(marcasMap.values());
    
    const ordenPersonalizado = (nombre: string): number => {
      if (nombre.includes('Toyota')) return 1;
      if (nombre.includes('Carsline')) return 2;
      if (nombre.includes('GWM')) return 3;
      if (nombre.includes('Subaru')) return 4;
      if (nombre.includes('Comprocars Pachuca')) return 6;
      if (nombre.includes('Comprocars')) return 5;
      return 7;
    };
    
    this.marcas.sort((a, b) => {
      const ordenA = ordenPersonalizado(a.nombre);
      const ordenB = ordenPersonalizado(b.nombre);
      return ordenA - ordenB;
    });
    
    this.marcasFiltradas = [...this.marcas];
  }

  aplicarFiltroPeriodo() {
    const hoy = new Date();
    let fechaInicio = new Date();
    
    switch (this.periodo) {
      case 'hoy':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        break;
      case 'semana':
        fechaInicio = new Date(hoy);
        fechaInicio.setDate(hoy.getDate() - 7);
        break;
      case 'mes':
        fechaInicio = new Date(hoy);
        fechaInicio.setMonth(hoy.getMonth() - 1);
        break;
      case 'todos':
      default:
        fechaInicio = new Date(0);
        break;
    }
    
    this.encuestasFiltradas = this.encuestas.filter(enc => {
      const fechaEnc = new Date(enc.fechaEnvio);
      return fechaEnc >= fechaInicio;
    });
    
    this.encuestasRecientes = [...this.encuestasFiltradas]
      .sort((a, b) => {
        const fechaA = new Date(a.fechaEnvio).getTime();
        const fechaB = new Date(b.fechaEnvio).getTime();
        return fechaB - fechaA;
      })
      .slice(0, 10);
    
    const marcasFiltradasMap = new Map();
    this.encuestasFiltradas.forEach(enc => {
      let nombreMarca = enc.marcaNombre || '';
      if (nombreMarca === 'Compro Pachuca') {
        nombreMarca = 'Comprocars Pachuca';
      }
      const nombreKey = this.normalizarTexto(nombreMarca);
      if (!marcasFiltradasMap.has(nombreKey)) {
        marcasFiltradasMap.set(nombreKey, {
          nombre: nombreMarca,
          total: 0,
          respondidas: 0,
          pendientes: 0
        });
      }
      const m = marcasFiltradasMap.get(nombreKey);
      m.total++;
      if (enc.estado === 'RESPONDIDA') m.respondidas++;
      else if (enc.estado === 'ENVIADA') m.pendientes++;
    });
    
    this.marcasFiltradas = this.marcas.filter(m => {
      const nombreKey = this.normalizarTexto(m.nombre);
      return marcasFiltradasMap.has(nombreKey);
    }).map(m => {
      const data = marcasFiltradasMap.get(this.normalizarTexto(m.nombre));
      return {
        ...m,
        total: data ? data.total : 0,
        respondidas: data ? data.respondidas : 0,
        pendientes: data ? data.pendientes : 0,
        tasaRespuesta: data && data.total > 0 ? Math.round((data.respondidas / data.total) * 100) : 0
      };
    });
    
    this.estadisticas.total = this.encuestasFiltradas.length;
    this.estadisticas.respondidas = this.encuestasFiltradas.filter(e => e.estado === 'RESPONDIDA').length;
    this.estadisticas.enviadas = this.encuestasFiltradas.filter(e => e.estado === 'ENVIADA').length;
    this.estadisticas.tasaRespuesta = this.estadisticas.total > 0 
      ? Math.round((this.estadisticas.respondidas / this.estadisticas.total) * 100) 
      : 0;
    
    if (this.graficosInicializados) {
      setTimeout(() => {
        this.crearGraficoMarcas();
        this.crearGraficoEvolucion();
      }, 300);
    }
  }

  filtrarPorPeriodo(periodo: 'hoy' | 'semana' | 'mes' | 'todos') {
    this.periodo = periodo;
    this.aplicarFiltroPeriodo();
    const textos = {
      'hoy': 'hoy',
      'semana': 'esta semana',
      'mes': 'este mes',
      'todos': 'todos los períodos'
    };
    this.notificationService.show('Filtrando por: ' + textos[periodo], 'info');
  }

  crearGraficoMarcas() {
    try {
      if (!this.graficoCanvas) {
        console.log('Canvas de marcas no encontrado');
        return;
      }
      
      if (this.grafico) {
        this.grafico.destroy();
        this.grafico = null;
      }
      
      const marcasMostrar = this.marcasFiltradas.length > 0 ? this.marcasFiltradas : this.marcas;
      if (marcasMostrar.length === 0) {
        return;
      }
      
      const ctx = this.graficoCanvas.nativeElement.getContext('2d');
      if (!ctx) {
        return;
      }
      
      this.grafico = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: marcasMostrar.map(m => m.nombre),
          datasets: [
            {
              label: 'Total encuestas',
              data: marcasMostrar.map(m => m.total),
              backgroundColor: 'rgba(198, 40, 40, 0.85)',
              borderColor: '#C62828',
              borderWidth: 2,
              borderRadius: 6
            },
            {
              label: 'Respondidas',
              data: marcasMostrar.map(m => m.respondidas),
              backgroundColor: 'rgba(46, 125, 50, 0.85)',
              borderColor: '#2E7D32',
              borderWidth: 2,
              borderRadius: 6
            },
            {
              label: 'Pendientes',
              data: marcasMostrar.map(m => m.pendientes),
              backgroundColor: 'rgba(21, 101, 192, 0.85)',
              borderColor: '#1565C0',
              borderWidth: 2,
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: { size: 12, weight: 500 },
                padding: 15,
                usePointStyle: true,
                pointStyle: 'circle',
                boxWidth: 12
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0,0,0,0.8)',
              titleFont: { size: 13, weight: 600 },
              bodyFont: { size: 12 },
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: function(context) {
                  return context.dataset.label + ': ' + context.parsed.y;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { 
                stepSize: 1, 
                font: { size: 11 },
                color: '#666'
              },
              grid: {
                color: 'rgba(0,0,0,0.06)'
              }
            },
            x: {
              ticks: { 
                font: { size: 10 },
                color: '#666',
                maxRotation: 30,
                minRotation: 0
              },
              grid: {
                display: false
              }
            }
          },
          animation: {
            duration: 800,
            easing: 'easeInOutQuart'
          }
        }
      });
    } catch (error) {
      console.error('Error al crear gráfico de marcas:', error);
    }
  }

  crearGraficoEvolucion() {
    try {
      if (!this.evolucionCanvas) {
        console.log('Canvas de evolución no encontrado');
        return;
      }
      
      if (this.graficoEvolucion) {
        this.graficoEvolucion.destroy();
        this.graficoEvolucion = null;
      }
      
      const encuestasParaGrafico = this.encuestasFiltradas.length > 0 ? this.encuestasFiltradas : this.encuestas;
      
      if (encuestasParaGrafico.length === 0) {
        return;
      }
      
      const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      const encuestasPorDia = [0, 0, 0, 0, 0, 0, 0];
      const respondidasPorDia = [0, 0, 0, 0, 0, 0, 0];
      
      const hoy = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const fecha = new Date(hoy);
        fecha.setDate(fecha.getDate() - i);
        const diaSemana = fecha.getDay();
        const diaIndex = diaSemana === 0 ? 6 : diaSemana - 1;
        
        encuestasParaGrafico.forEach(enc => {
          const fechaEnc = new Date(enc.fechaEnvio);
          if (fechaEnc.toDateString() === fecha.toDateString()) {
            encuestasPorDia[diaIndex]++;
            if (enc.estado === 'RESPONDIDA') {
              respondidasPorDia[diaIndex]++;
            }
          }
        });
      }
      
      const ctx = this.evolucionCanvas.nativeElement.getContext('2d');
      if (!ctx) {
        return;
      }
      
      this.graficoEvolucion = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dias,
          datasets: [
            {
              label: 'Encuestas enviadas',
              data: encuestasPorDia,
              borderColor: '#C62828',
              backgroundColor: 'rgba(198, 40, 40, 0.12)',
              tension: 0.4,
              fill: true,
              pointBackgroundColor: '#C62828',
              pointBorderColor: 'white',
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7,
              borderWidth: 3
            },
            {
              label: 'Encuestas respondidas',
              data: respondidasPorDia,
              borderColor: '#2E7D32',
              backgroundColor: 'rgba(46, 125, 50, 0.12)',
              tension: 0.4,
              fill: true,
              pointBackgroundColor: '#2E7D32',
              pointBorderColor: 'white',
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7,
              borderWidth: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: { size: 12, weight: 500 },
                padding: 15,
                usePointStyle: true,
                pointStyle: 'circle',
                boxWidth: 12
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0,0,0,0.8)',
              titleFont: { size: 13, weight: 600 },
              bodyFont: { size: 12 },
              padding: 12,
              cornerRadius: 8
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { 
                stepSize: 1, 
                font: { size: 11 },
                color: '#666'
              },
              grid: {
                color: 'rgba(0,0,0,0.06)'
              }
            },
            x: {
              ticks: { 
                font: { size: 11 },
                color: '#666'
              },
              grid: {
                display: false
              }
            }
          },
          animation: {
            duration: 800,
            easing: 'easeInOutQuart'
          }
        }
      });
    } catch (error) {
      console.error('Error al crear gráfico de evolución:', error);
    }
  }

  obtenerLogo(marcaId: number): string {
    return this.logos[marcaId] || 'default.svg';
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const parent = img.parentElement;
    if (parent) {
      const fallback = document.createElement('span');
      fallback.style.cssText = 'font-weight: 700; color: #C62828; font-size: 0.85rem; background: #f5f5f5; padding: 3px 8px; border-radius: 4px;';
      const marcaId = Number(img.getAttribute('data-marca-id'));
      const marca = this.marcas.find(m => m.id === marcaId);
      if (marca) {
        const palabras = marca.nombre.split(' ');
        let iniciales = '';
        for (let i = 0; i < Math.min(palabras.length, 2); i++) {
          iniciales += palabras[i].charAt(0).toUpperCase();
        }
        fallback.textContent = iniciales || '?';
      } else {
        fallback.textContent = '?';
      }
      parent.appendChild(fallback);
    }
  }

  getEstadoClass(estado: string): string {
    const classes: { [key: string]: string } = {
      'ENVIADA': 'badge-enviada',
      'RESPONDIDA': 'badge-respondida',
      'EXPIRADA': 'badge-expirada'
    };
    return classes[estado] || '';
  }

  formatFecha(fecha: Date | string): string {
    if (!fecha) return '-';
    const d = new Date(fecha);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    const horas = String(d.getHours()).padStart(2, '0');
    const minutos = String(d.getMinutes()).padStart(2, '0');
    return dia + '/' + mes + '/' + anio + ' ' + horas + ':' + minutos;
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
    
    return count > 0 ? Math.round((total / count) * 10) / 10 : 0;
  }

  getEstadoTexto(estado: string): string {
    const textos: { [key: string]: string } = {
      'ENVIADA': 'Enviada',
      'RESPONDIDA': 'Respondida',
      'EXPIRADA': 'Expirada'
    };
    return textos[estado] || estado;
  }

  generarLink(token: string): string {
    return this.encuestaService.generarLinkEncuesta(token);
  }

  copiarLink(token: string) {
    this.copiando = true;
    const link = this.generarLink(token);
    navigator.clipboard.writeText(link).then(() => {
      this.notificationService.show('Link copiado al portapapeles', 'success');
      this.copiando = false;
    }).catch(() => {
      this.notificationService.show('Error al copiar el link', 'error');
      this.copiando = false;
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

  refrescarDatos() {
    localStorage.removeItem('dashboard_stats');
    localStorage.removeItem('dashboard_stats_time');
    this.cargarDatosCompletos();
    this.notificationService.show('Datos actualizados', 'info');
  }

exportarEstadisticas() {
  const marcasMostrar = this.marcasFiltradas.length > 0 ? this.marcasFiltradas : this.marcas;
  if (marcasMostrar.length === 0) {
    this.notificationService.show('No hay datos para exportar', 'warning');
    return;
  }
  
  const data = marcasMostrar.map(marca => ({
    'Marca': marca.nombre,
    'Total': marca.total,
    'Respondidas': marca.respondidas,
    'Pendientes': marca.pendientes,
    'Promedio': marca.promedio,
    'Tasa de Respuesta': marca.tasaRespuesta + '%'
  }));

  // Agregar fila de totales
  const totalGeneral = {
    'Marca': 'TOTAL GENERAL',
    'Total': data.reduce((sum, item) => sum + item.Total, 0),
    'Respondidas': data.reduce((sum, item) => sum + item.Respondidas, 0),
    'Pendientes': data.reduce((sum, item) => sum + item.Pendientes, 0),
    'Promedio': (data.reduce((sum, item) => sum + parseFloat(item.Promedio.toString()), 0) / data.length).toFixed(1),
    'Tasa de Respuesta': (data.reduce((sum, item) => sum + parseFloat(item['Tasa de Respuesta']), 0) / data.length).toFixed(1) + '%'
  };
  data.push(totalGeneral);

  // Crear libro de Excel
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Estadisticas');
  
  // Ajustar ancho de columnas
  const colWidths = [
    { wch: 30 }, // Marca
    { wch: 12 }, // Total
    { wch: 14 }, // Respondidas
    { wch: 14 }, // Pendientes
    { wch: 12 }, // Promedio
    { wch: 18 }  // Tasa de Respuesta
  ];
  ws['!cols'] = colWidths;

  // Descargar archivo
  const fileName = `estadisticas_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
  
  this.notificationService.show('Estadísticas exportadas correctamente', 'success');
}
}