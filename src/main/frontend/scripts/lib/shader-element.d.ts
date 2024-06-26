import { customElement } from "lit/decorators.js";
import { LitElement } from "lit";

@customElement('shader-element')
export class ShaderElement extends LitElement {
    /**
     * Creates and compiles a shader.
     *
     * @param {!WebGLRenderingContext} gl The WebGL Context.
     * @param {string} shaderSource The GLSL source code for the shader.
     * @param {number} shaderType The type of shader, VERTEX_SHADER or
     *     FRAGMENT_SHADER.
     * @return {!WebGLShader} The shader.
     */
    compileShader(gl: WebGLRenderingContext, shaderSource: string, shaderType: number): WebGLShader;

    /**
     * Creates a program from 2 shaders.
     *
     * @param {!WebGLRenderingContext} gl The WebGL context.
     * @param {!WebGLShader} vertexShader A vertex shader.
     * @param {!WebGLShader} fragmentShader A fragment shader.
     * @return {!WebGLProgram} A program.
     */
    createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram;

    /**
     * Creates a shader from the content of a script tag.
     *
     * @param {!WebGLRenderingContext} gl The WebGL Context.
     * @param {string} scriptId The id of the script tag.
     * @param {string} opt_shaderType. The type of shader to create.
     *     If not passed in will use the type attribute from the
     *     script tag.
     * @return {!WebGLShader} A shader.
     */
    createShaderFromScript(gl: WebGLRenderingContext, scriptId: string, opt_shaderType: any): WebGLShader;

    /**
     * Creates a program from 2 script tags.
     *
     * @param {!WebGLRenderingContext} gl The WebGL Context.
     * @param {string} vertexShaderId The id of the vertex shader script tag.
     * @param {string} fragmentShaderId The id of the fragment shader script tag.
     * @return {!WebGLProgram} A program
     */
    createProgramFromScripts(gl: WebGLRenderingContext, vertexShaderId: string, fragmentShaderId: string): WebGLProgram;
}