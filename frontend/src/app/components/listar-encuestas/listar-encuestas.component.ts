import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EncuestaService } from '../../services/encuesta.service';
import { Encuesta } from '../../models/encuesta.model';
import { NotificationService } from '../../services/notification.service';
import * as XLSX from 'xlsx';

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
    private router: Router,
    private notificationService: NotificationService
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

  eliminarEncuesta(encuesta: Encuesta) {
    if (!encuesta.id) {
      this.notificationService.show('No se puede eliminar: ID no encontrado', 'error');
      return;
    }

    if (confirm('¿Estas seguro de eliminar la encuesta de ' + encuesta.clienteNombre + '? Esta accion no se puede deshacer.')) {
      this.encuestaService.eliminarEncuesta(encuesta.id).subscribe({
        next: () => {
          this.notificationService.show('Encuesta de ' + encuesta.clienteNombre + ' eliminada correctamente', 'success');
          this.cargarEncuestas();
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
          this.notificationService.show('Error al eliminar la encuesta', 'error');
        }
      });
    }
  }

  exportarExcel() {
    if (this.encuestasFiltradas.length === 0) {
      this.notificationService.show('No hay encuestas para exportar', 'warning');
      return;
    }

    const data = this.encuestasFiltradas.map(e => ({
      'Cliente': e.clienteNombre,
      'Email': e.clienteEmail,
      'Marca': e.marcaNombre,
      'Estado': this.getEstadoTexto(e.estado),
      'Fecha Envio': e.fechaEnvio ? new Date(e.fechaEnvio).toLocaleString('es-MX') : '',
      'Fecha Respuesta': e.fechaRespuesta ? new Date(e.fechaRespuesta).toLocaleString('es-MX') : '',
      'Token': e.token,
      'Link': this.generarLink(e.token)
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Encuestas');
    
    const colWidths = [
      { wch: 35 },
      { wch: 30 },
      { wch: 25 },
      { wch: 12 },
      { wch: 20 },
      { wch: 20 },
      { wch: 40 },
      { wch: 50 }
    ];
    ws['!cols'] = colWidths;

    const fileName = 'encuestas_' + new Date().toISOString().split('T')[0] + '.xlsx';
    XLSX.writeFile(wb, fileName);
    
    this.notificationService.show('Encuestas exportadas correctamente', 'success');
  }

  getEstadoClass(estado: string): string {
    const classes: { [key: string]: string } = {
      'ENVIADA': 'badge-enviada',
      'RESPONDIDA': 'badge-respondida',
      'EXPIRADA': 'badge-expirada'
    };
    return classes[estado] || '';
  }

  getEstadoTexto(estado: string): string {
    const textos: { [key: string]: string } = {
      'ENVIADA': 'Enviada',
      'RESPONDIDA': 'Respondida',
      'EXPIRADA': 'Expirada'
    };
    return textos[estado] || estado;
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

  generarLink(token: string): string {
    return this.encuestaService.generarLinkEncuesta(token);
  }

  copiarLink(token: string, clienteNombre: string) {
    const link = this.generarLink(token);
    navigator.clipboard.writeText(link).then(() => {
      this.notificationService.show('Link copiado para ' + clienteNombre, 'success');
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