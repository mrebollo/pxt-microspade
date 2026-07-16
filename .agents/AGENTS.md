# Reglas de Agente para `pxt-microspade`

Este proyecto se compila exclusivamente para el hardware BBC micro:bit utilizando **Static TypeScript** (el compilador de MakeCode). Es fundamental seguir estas directrices para evitar errores de compilación y permitir la generación de bloques:

1. **Prohibido el uso del tipo `any`**: Todos los tipos de datos en variables, parámetros de funciones y retornos deben ser declarados explícitamente (`number`, `string`, `boolean`, clases específicas o funciones).
2. **Evitar métodos de prototipo de `Object`**: No usar métodos dinámicos como `hasOwnProperty()`, `Object.keys()`, etc., sobre diccionarios o mapas de tipo `{[key: string]: T}`. Usa comparaciones directas contra `undefined` (ej. `map[key] !== undefined`).
3. **No usar Generadores ni `async/await`**: Para la concurrencia y la multitarea cooperativa, utiliza la API de fibras nativa de MakeCode: `control.runInBackground(...)` y esperas con `basic.pause(ms)`.
4. **Declaración estática**: Evita reflexión, metaprogramación y manipulación dinámica de prototipos.
5. **Tipado estricto en la KB del Agente**: Para la Base de Conocimientos (KB) de los agentes, utiliza métodos específicos por tipo (`setNumber`, `getNumber`, `setString`, `getString`, `setBoolean`, `getBoolean`) en lugar de almacenar tipos heterogéneos en una base de datos genérica.
