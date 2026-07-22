import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { EncuestaService } from '../../services/encuesta.service';

@Component({
  selector: 'app-importar-encuestas',
  templateUrl: './importar-encuestas.component.html',
  styleUrls: ['./importar-encuestas.component.css']
})
export class ImportarEncuestasComponent {
  archivoSeleccionado: File | null = null;
  datosExcel: any[] = [];
  loading = false;
  procesando = false;
  encuestasGeneradas: any[] = [];
  errores: string[] = [];
  mostrarResultados = false;
  totalRegistros = 0;
  exitosos = 0;
  fallidos = 0;
  mensajeToast = '';
  tipoToast = '';
  tipoPlantilla: 'POSTVENTA' | 'VENTA' = 'POSTVENTA';
  mostrarSelectorPlantilla = false;

  marcasMap: { [key: string]: number } = {
    'Subaru': 5,
    'Toyota Pachuca': 1,
    'Carsline Pachuca': 2,
    'Carsline Queretaro': 3,
    'Carsline Querétaro': 3,
    'GMW': 4,
    'GWM Queretaro': 4,
    'GWM Querétaro': 4,
    'CompraCars Pachuca': 6,
    'CompraCars Querétaro': 6,
    'ComproCars Queretaro': 6,
    'ComproCars Querétaro': 6,
    'Compro Pachuca': 7
  };

  imagenesMarca: { [key: string]: string } = {
    'Subaru': 'assets/whatsapp/subaruPachuca.png',
    'Toyota Pachuca': 'assets/whatsapp/toyotaPachuca.jpeg',
    'Toyota Tulancingo': 'assets/whatsapp/toyotaTulancingo.jpeg',
    'Carsline Pachuca': 'assets/whatsapp/carsline.png',
    'Carsline Queretaro': 'assets/whatsapp/carsline.png',
    'Carsline Querétaro': 'assets/whatsapp/carsline.png',
    'GMW': 'assets/whatsapp/comproCars.png',
    'GWM Queretaro': 'assets/whatsapp/comproCars.png',
    'GWM Querétaro': 'assets/whatsapp/comproCars.png',
    'CompraCars Pachuca': 'assets/whatsapp/comproCars.png',
    'CompraCars Querétaro': 'assets/whatsapp/comproCars.png',
    'ComproCars Queretaro': 'assets/whatsapp/comproCars.png',
    'ComproCars Querétaro': 'assets/whatsapp/comproCars.png',
    'Compro Pachuca': 'assets/whatsapp/comproCars.png'
  };

  emojis = {
    manosArriba: '🙌🏽',
    auto: '🚗',
    herramienta: '🧰',
    gracias: '☺️',
    bienvenida: '🙌🏽',
    estrella: '⭐',
    punto: '👉'
  };

  constructor(private encuestaService: EncuestaService) {}

  onFileChange(event: any) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.archivoSeleccionado = target.files[0];
      this.procesarArchivo();
    }
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info') {
    this.mensajeToast = mensaje;
    this.tipoToast = tipo;
    setTimeout(() => {
      this.mensajeToast = '';
    }, 4000);
  }

  procesarArchivo() {
    if (!this.archivoSeleccionado) {
      this.mostrarMensaje('Seleccione un archivo', 'warning');
      return;
    }

    this.loading = true;
    this.errores = [];
    this.datosExcel = [];

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        console.log('Columnas del Excel:', Object.keys(jsonData[0] || {}));
        console.log('Primer registro completo:', jsonData[0]);

        jsonData.forEach((row: any, index: number) => {
          let fecha = '';
          
          const posiblesNombresFecha = ['FECHA', 'fecha', 'Fecha', 'A', 'Fecha Venta', 'FECHA VENTA'];
          for (const nombre of posiblesNombresFecha) {
            if (row[nombre] !== undefined && row[nombre] !== null && row[nombre] !== '') {
              fecha = row[nombre];
              console.log('Fecha encontrada en columna "' + nombre + '": ' + fecha);
              break;
            }
          }

          if (!fecha) {
            const values = Object.values(row);
            if (values.length > 0 && values[0]) {
              fecha = String(values[0]);
              console.log('Fecha tomada de la primera columna: ' + fecha);
            }
          }

          const noFactura = row['NO FACTURA'] || row['B'] || '';
          const tipo = row['ALTA/BAJA'] || row['C'] || '';
          const serie = row['SERIE'] || row['D'] || '';
          const unidad = row['UNIDAD'] || row['E'] || '';
          const anio = row['AÑO'] || row['F'] || '';
          const asesor = row['ASESOR'] || row['G'] || '';
          const marcaNombre = row['Marca'] || row['marca'] || '';
          const nombreCliente = row['NOMBRE CLIENTE'] || row['H'] || '';
          const telefono = row['TELEFONO'] || row['I'] || '';

          if (nombreCliente && nombreCliente.toString().trim()) {
            const marcaId = this.obtenerMarcaId(marcaNombre);
            const fechaConvertida = this.convertirFecha(fecha);

            this.datosExcel.push({
              index: index + 1,
              fecha: fechaConvertida,
              noFactura: noFactura ? noFactura.toString().trim() : '',
              tipo: tipo ? tipo.toString().trim() : '',
              serie: serie ? serie.toString().trim() : '',
              unidad: unidad ? unidad.toString().trim() : '',
              anio: anio ? anio.toString().trim() : '',
              asesor: asesor ? asesor.toString().trim() : '',
              marcaNombre: marcaNombre ? marcaNombre.toString().trim() : 'Subaru',
              marcaId: marcaId,
              nombreCliente: nombreCliente.toString().trim(),
              telefono: telefono ? telefono.toString().trim() : '',
              procesado: false,
              exito: false,
              error: ''
            });
          }
        });

        this.totalRegistros = this.datosExcel.length;
        this.mostrarResultados = true;
        this.loading = false;

        if (this.totalRegistros > 0) {
          this.mostrarSelectorPlantilla = true;
        }

        this.mostrarMensaje(
          'Se encontraron ' + this.totalRegistros + ' clientes para generar encuestas',
          'info'
        );
      } catch (error) {
        console.error('Error al leer archivo:', error);
        this.loading = false;
        this.mostrarMensaje('Error al leer el archivo Excel', 'error');
      }
    };

    reader.readAsArrayBuffer(this.archivoSeleccionado);
  }

  obtenerMarcaId(nombreMarca: string): number {
    if (!nombreMarca) return 5;
    
    const nombreLimpio = nombreMarca.trim();
    
    if (this.marcasMap[nombreLimpio]) {
      return this.marcasMap[nombreLimpio];
    }
    
    for (const key of Object.keys(this.marcasMap)) {
      if (nombreLimpio.toLowerCase().includes(key.toLowerCase()) || 
          key.toLowerCase().includes(nombreLimpio.toLowerCase())) {
        return this.marcasMap[key];
      }
    }
    
    return 5;
  }

  obtenerImagenMarca(nombreMarca: string): string {
    if (!nombreMarca) return 'assets/whatsapp/subaruPachuca.png';
    
    if (this.imagenesMarca[nombreMarca]) {
      return this.imagenesMarca[nombreMarca];
    }
    
    for (const key of Object.keys(this.imagenesMarca)) {
      if (nombreMarca.toLowerCase().includes(key.toLowerCase()) || 
          key.toLowerCase().includes(nombreMarca.toLowerCase())) {
        return this.imagenesMarca[key];
      }
    }
    
    return 'assets/whatsapp/subaruPachuca.png';
  }

  obtenerUrlImagen(marcaNombre: string): string {
    const imagenPath = this.obtenerImagenMarca(marcaNombre);
    // Para producción en Railway
    const baseUrl = 'https://inmotion-frontend.up.railway.app';
    // Para desarrollo local:
    // const baseUrl = 'http://localhost:80';
    return baseUrl + '/' + imagenPath;
  }

  convertirFecha(valor: any): string {
    if (!valor) return '';
    
    console.log('Convirtiendo fecha:', valor, 'Tipo:', typeof valor);
    
    if (typeof valor === 'number') {
      const fecha = new Date(1899, 11, 30);
      fecha.setDate(fecha.getDate() + valor);
      const resultado = fecha.toISOString().split('T')[0];
      console.log('Fecha convertida desde numero:', resultado);
      return resultado;
    }
    
    if (typeof valor === 'string') {
      const numero = parseFloat(valor);
      if (!isNaN(numero) && numero > 10000 && numero < 60000) {
        const fecha = new Date(1899, 11, 30);
        fecha.setDate(fecha.getDate() + numero);
        const resultado = fecha.toISOString().split('T')[0];
        console.log('Fecha convertida desde string numerico:', resultado);
        return resultado;
      }
      
      const fecha = new Date(valor);
      if (!isNaN(fecha.getTime())) {
        const resultado = fecha.toISOString().split('T')[0];
        console.log('Fecha convertida desde string ISO:', resultado);
        return resultado;
      }
      
      const partes = valor.split('/');
      if (partes.length === 3) {
        const dia = parseInt(partes[0]);
        const mes = parseInt(partes[1]) - 1;
        const anio = parseInt(partes[2]);
        if (!isNaN(dia) && !isNaN(mes) && !isNaN(anio)) {
          const resultado = anio + '-' + String(mes + 1).padStart(2, '0') + '-' + String(dia).padStart(2, '0');
          console.log('Fecha convertida desde dd/mm/yyyy:', resultado);
          return resultado;
        }
      }
      
      if (partes.length === 2) {
        const dia = parseInt(partes[0]);
        const mes = parseInt(partes[1]) - 1;
        if (!isNaN(dia) && !isNaN(mes)) {
          const anioActual = new Date().getFullYear();
          const resultado = anioActual + '-' + String(mes + 1).padStart(2, '0') + '-' + String(dia).padStart(2, '0');
          console.log('Fecha convertida desde dd/mm:', resultado);
          return resultado;
        }
      }
    }
    
    console.log('No se pudo convertir la fecha:', valor);
    return '';
  }

  formatearFecha(fechaStr: string): string {
    if (!fechaStr) return 'fecha de visita';
    
    console.log('Formateando fecha:', fechaStr);
    
    const fecha = new Date(fechaStr);
    if (!isNaN(fecha.getTime())) {
      const resultado = fecha.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      console.log('Fecha formateada correctamente:', resultado);
      return resultado;
    }
    
    console.log('Fecha no valida, retornando texto por defecto');
    return fechaStr || 'fecha de visita';
  }

  generarPlantilla(cliente: any, link: string): string {
    const nombreCliente = cliente.nombreCliente || 'Cliente';
    const nombreAsesor = cliente.asesor || 'Asesor de Servicio';
    const nombreMarca = cliente.marcaNombre || 'Subaru';
    const modeloAuto = cliente.unidad || 'su vehiculo';
    const fechaVisita = cliente.fecha ? this.formatearFecha(cliente.fecha) : 'fecha de visita';
    
    const imagenUrl = this.obtenerUrlImagen(nombreMarca);

    let plantilla = '';

    plantilla = imagenUrl + '\n\n';

    if (this.tipoPlantilla === 'VENTA') {
      plantilla += 'Buen dia, Sr./Srita. *' + nombreCliente + '*.\n';
      plantilla += 'Mi nombre es *' + nombreAsesor + '* y formo parte del area de Satisfaccion a Clientes de *' + nombreMarca + '* ' + this.emojis.manosArriba + '.\n';
      plantilla += 'Agradecemos sinceramente el tiempo que nos brindo al visitarnos. Fue un placer atenderle y acompanarle durante la adquisicion de su *' + modeloAuto + '*.\n';
      plantilla += 'Nos gustaria conocer su opinion sobre la atencion recibida tanto por parte de nuestra agencia como de su asesor *' + nombreAsesor + '*. Por ello, le invitamos a responder nuestra encuesta de satisfaccion, la cual le tomara solo unos minutos.\n';
      plantilla += 'Para participar, por favor haga clic en el siguiente enlace:\n';
      plantilla += this.emojis.punto + ' ' + link + '\n';
      plantilla += 'Muchas gracias por su tiempo y confianza.\n';
      plantilla += '¡Le damos la mas cordial bienvenida a la familia *' + nombreMarca + '*! ' + this.emojis.bienvenida + ' ' + this.emojis.auto;
    } else {
      plantilla += 'Buen dia, Sr./Srita. *' + nombreCliente + '*.\n';
      plantilla += 'Mi nombre es *' + nombreAsesor + '* de Satisfaccion a Clientes de *' + nombreMarca + '* ' + this.emojis.manosArriba + '.\n';
      plantilla += 'Agradecemos sinceramente el tiempo que nos brindo al visitarnos en nuestra agencia, fue un gusto atenderle y acompanarle durante su estancia.\n';
      plantilla += 'Nos gustaria conocer su opinion respecto al servicio realizado a su *' + modeloAuto + '* el dia *' + fechaVisita + '* ' + this.emojis.auto + this.emojis.herramienta + '.\n';
      plantilla += 'Lo invitamos a responder nuestra encuesta de satisfaccion; le tomara solo unos minutos.\n\n';
      plantilla += 'Por favor, haz clic en el siguiente enlace para participar:\n';
      plantilla += this.emojis.punto + ' ' + link + '\n';
      plantilla += '¡Muchas gracias por su tiempo! ' + this.emojis.gracias + ' ' + this.emojis.auto;
    }

    return plantilla;
  }

  generarEncuestas() {
    if (this.datosExcel.length === 0) {
      this.mostrarMensaje('No hay datos para procesar', 'warning');
      return;
    }

    this.procesando = true;
    this.exitosos = 0;
    this.fallidos = 0;
    this.encuestasGeneradas = [];
    this.errores = [];

    const pendientes = this.datosExcel.filter(d => !d.procesado);

    if (pendientes.length === 0) {
      this.mostrarMensaje('Todos los clientes ya fueron procesados', 'info');
      this.procesando = false;
      return;
    }

    let completados = 0;

    pendientes.forEach((cliente, index) => {
      setTimeout(() => {
        const nombreCompleto = cliente.nombreCliente;
        const partes = nombreCompleto.split(' ');
        const nombre = partes[0] || '';
        const apellido = partes.slice(1).join(' ') || '';

        const marcaId = cliente.marcaId || 5;

        const data = {
          nombre: nombre,
          apellido: apellido,
          email: '',
          telefono: cliente.telefono || '5512345678',
          serie: cliente.serie || '',
          marcaId: marcaId,
          tipo: this.tipoPlantilla,
          respuestas: []
        };

        this.encuestaService.crearEncuesta(data).subscribe({
          next: (response) => {
            cliente.procesado = true;
            cliente.exito = true;
            
            const link = this.encuestaService.generarLinkEncuesta(response.token);
            const plantillaCompleta = this.generarPlantilla(cliente, link);
            
            this.exitosos++;
            this.encuestasGeneradas.push({
              cliente: cliente.nombreCliente,
              marca: cliente.marcaNombre || 'Subaru',
              token: response.token,
              link: link,
              plantilla: plantillaCompleta,
              mostrarPlantilla: false,
              imagenUrl: this.obtenerUrlImagen(cliente.marcaNombre || 'Subaru')
            });
            completados++;
            if (completados === pendientes.length) {
              this.procesando = false;
              this.mostrarSelectorPlantilla = false;
              this.mostrarMensaje(
                'Se generaron ' + this.exitosos + ' encuestas, ' + this.fallidos + ' fallaron',
                this.fallidos === 0 ? 'success' : 'warning'
              );
            }
          },
          error: (error) => {
            cliente.procesado = true;
            cliente.exito = false;
            cliente.error = error.message || 'Error al crear encuesta';
            this.fallidos++;
            this.errores.push(cliente.nombreCliente + ': ' + cliente.error);
            completados++;
            if (completados === pendientes.length) {
              this.procesando = false;
              this.mostrarSelectorPlantilla = false;
              this.mostrarMensaje(
                'Se generaron ' + this.exitosos + ' encuestas, ' + this.fallidos + ' fallaron',
                this.fallidos === 0 ? 'success' : 'warning'
              );
            }
          }
        });
      }, index * 500);
    });
  }

  cambiarPlantilla(tipo: 'POSTVENTA' | 'VENTA') {
    this.tipoPlantilla = tipo;
    this.mostrarMensaje('Plantilla cambiada a: ' + (tipo === 'VENTA' ? 'Venta' : 'Post Venta'), 'info');
  }

  copiarLink(token: string) {
    const link = this.encuestaService.generarLinkEncuesta(token);
    navigator.clipboard.writeText(link);
    this.mostrarMensaje('Link copiado al portapapeles', 'success');
  }

  copiarPlantilla(plantilla: string) {
    navigator.clipboard.writeText(plantilla);
    this.mostrarMensaje('Plantilla copiada al portapapeles', 'success');
  }

  copiarTodosLosLinks() {
    const links = this.encuestasGeneradas.map(e => e.link).join('\n');
    navigator.clipboard.writeText(links);
    this.mostrarMensaje('Todos los links copiados', 'success');
  }

  limpiar() {
    this.archivoSeleccionado = null;
    this.datosExcel = [];
    this.encuestasGeneradas = [];
    this.errores = [];
    this.mostrarResultados = false;
    this.totalRegistros = 0;
    this.exitosos = 0;
    this.fallidos = 0;
    this.mostrarSelectorPlantilla = false;
    this.tipoPlantilla = 'POSTVENTA';
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) input.value = '';
  }

  descargarReporte() {
    if (this.encuestasGeneradas.length === 0) {
      this.mostrarMensaje('No hay encuestas generadas para exportar', 'warning');
      return;
    }

    const data = this.encuestasGeneradas.map(e => ({
      'Cliente': e.cliente,
      'Marca': e.marca,
      'Link': e.link,
      'Plantilla': e.plantilla
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Encuestas Generadas');
    
    const colWidths = [
      { wch: 35 },
      { wch: 25 },
      { wch: 50 },
      { wch: 80 }
    ];
    ws['!cols'] = colWidths;

    const resumenData = [
      ['REPORTE DE ENCUESTAS GENERADAS'],
      [''],
      ['Total procesados:', this.totalRegistros],
      ['Exitosos:', this.exitosos],
      ['Fallidos:', this.fallidos],
      ['Tipo de plantilla:', this.tipoPlantilla === 'VENTA' ? 'Venta' : 'Post Venta'],
      [''],
      ['Fecha de generacion:', new Date().toLocaleString('es-MX')]
    ];
    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    const fileName = 'encuestas_generadas_' + new Date().toISOString().split('T')[0] + '.xlsx';
    XLSX.writeFile(wb, fileName);
    
    this.mostrarMensaje('Reporte exportado correctamente', 'success');
  }
}