# Notification Service

Este servicio de notificaciones está construido con Node.js y TypeScript. Puedes ejecutarlo localmente usando `npm` o en un contenedor Docker.

---

## 🚀 Requisitos Previos

* [Node.js](https://nodejs.org/) (versión 18 recomendada)
* [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
* [Docker](https://www.docker.com/) instalado (opcional, si deseas usar contenedores)

---

## 📦 Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/notification-service.git
cd notification-service
```

2. Instala las dependencias:

```bash
npm install
```

---

## 🧪 Scripts disponibles

| Comando                 | Descripción                                                          |
| ----------------------- | -------------------------------------------------------------------- |
| `npm run dev`           | Ejecuta el proyecto en modo desarrollo con `nodemon`.                |
| `npm run build`         | Compila el código TypeScript y copia los archivos YAML a `dist/`.    |
| `npm start`             | Ejecuta el proyecto desde `dist/index.js`. Requiere `npm run build`. |
| `npm test`              | Ejecuta los tests con `jest`.                                        |
| `npm run test:watch`    | Ejecuta los tests en modo observador.                                |
| `npm run test:coverage` | Muestra el reporte de cobertura de pruebas.                          |

---

## 🐳 Ejecutar con Docker

1. Asegúrate de que todos los archivos estén listos y el proyecto compilable.

2. Construye la imagen Docker:

```bash
docker build -t notification-service .
```

3. Ejecuta el contenedor:

```bash
docker run -p 4052:4052 notification-service
```

> Esto expondrá la aplicación en `http://localhost:4052`.

---

## 📃 Dockerfile utilizado

```Dockerfile
# Usa una imagen base oficial de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo en el contenedor
WORKDIR /src

# Copia los archivos del proyecto al contenedor
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos
COPY . .

# Compila TypeScript
RUN npm run build

# Expone el puerto en el que corre tu aplicación
EXPOSE 4052

# Comando para iniciar la aplicación
CMD ["node", "dist/index.js"]
```

---

## 📂 Estructura del Proyecto

```
.
├── src/
│   └── index.ts          # Punto de entrada principal
├── dist/                 # Código compilado (se genera con `npm run build`)
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

---

## 📝 Notas

* Asegúrate de que el archivo `tsconfig.json` esté configurado para compilar TypeScript en la carpeta `dist/`.
* El comando `copyfiles -u 1 src/**/*.yaml dist/` copia archivos `.yaml` desde `src/` a `dist/`. Esto es útil si estás usando Swagger u otra configuración basada en YAML.

---

## 📢 Contacto

Para dudas o sugerencias, puedes abrir un issue en el repositorio o contactar al autor del proyecto.
