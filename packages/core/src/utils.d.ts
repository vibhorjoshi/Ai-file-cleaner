export declare class HashGenerator {
    /**
     * Generate SHA-256 hash for exact duplicate detection
     */
    static generateSHA256(data: Buffer): string;
    /**
     * Generate MD5 hash (faster for large files)
     */
    static generateMD5(data: Buffer): string;
    /**
     * Generate content-based hash for text files (ignoring whitespace)
     */
    static generateContentHash(text: string): string;
    /**
     * Generate perceptual hash for images (simplified version)
     */
    static generatePerceptualHash(imageData: Buffer): string;
}
export declare class FileTypeDetector {
    private static readonly IMAGE_EXTENSIONS;
    private static readonly TEXT_EXTENSIONS;
    private static readonly DOCUMENT_EXTENSIONS;
    static isImage(filename: string): boolean;
    static isText(filename: string): boolean;
    static isDocument(filename: string): boolean;
    static getFileType(filename: string): 'image' | 'text' | 'document' | 'other';
    private static getExtension;
}
export declare class PathUtils {
    /**
     * Normalize file path for consistent comparison
     */
    static normalizePath(path: string): string;
    /**
     * Get relative path from base directory
     */
    static getRelativePath(fullPath: string, basePath: string): string;
    /**
     * Extract filename without extension
     */
    static getBaseName(filename: string): string;
    /**
     * Get file extension
     */
    static getExtension(filename: string): string;
}
export declare class TextPreprocessor {
    /**
     * Extract clean text from different file types
     */
    static preprocessText(text: string, options?: {
        removeNumbers?: boolean;
        removePunctuation?: boolean;
        minWordLength?: number;
    }): string;
    /**
     * Extract keywords from text
     */
    static extractKeywords(text: string, maxKeywords?: number): string[];
}
