"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextPreprocessor = exports.PathUtils = exports.FileTypeDetector = exports.HashGenerator = void 0;
const crypto_1 = __importDefault(require("crypto"));
class HashGenerator {
    /**
     * Generate SHA-256 hash for exact duplicate detection
     */
    static generateSHA256(data) {
        return crypto_1.default.createHash('sha256').update(data).digest('hex');
    }
    /**
     * Generate MD5 hash (faster for large files)
     */
    static generateMD5(data) {
        return crypto_1.default.createHash('md5').update(data).digest('hex');
    }
    /**
     * Generate content-based hash for text files (ignoring whitespace)
     */
    static generateContentHash(text) {
        const normalized = text
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
        return crypto_1.default.createHash('sha256').update(normalized).digest('hex');
    }
    /**
     * Generate perceptual hash for images (simplified version)
     */
    static generatePerceptualHash(imageData) {
        // This is a simplified version - in production, use dedicated libraries
        const hash = crypto_1.default.createHash('sha1').update(imageData).digest('hex');
        return hash.substring(0, 16); // Take first 16 chars as perceptual hash
    }
}
exports.HashGenerator = HashGenerator;
class FileTypeDetector {
    static isImage(filename) {
        const ext = this.getExtension(filename);
        return this.IMAGE_EXTENSIONS.has(ext);
    }
    static isText(filename) {
        const ext = this.getExtension(filename);
        return this.TEXT_EXTENSIONS.has(ext);
    }
    static isDocument(filename) {
        const ext = this.getExtension(filename);
        return this.DOCUMENT_EXTENSIONS.has(ext);
    }
    static getFileType(filename) {
        if (this.isImage(filename))
            return 'image';
        if (this.isText(filename))
            return 'text';
        if (this.isDocument(filename))
            return 'document';
        return 'other';
    }
    static getExtension(filename) {
        const parts = filename.toLowerCase().split('.');
        return parts.length > 1 ? `.${parts.pop()}` : '';
    }
}
exports.FileTypeDetector = FileTypeDetector;
FileTypeDetector.IMAGE_EXTENSIONS = new Set([
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.tif', '.svg'
]);
FileTypeDetector.TEXT_EXTENSIONS = new Set([
    '.txt', '.md', '.json', '.js', '.ts', '.py', '.java', '.cpp', '.c', '.h',
    '.css', '.html', '.xml', '.yml', '.yaml', '.sql', '.sh', '.bat', '.ps1',
    '.rs', '.go', '.php', '.rb', '.cs', '.kt', '.swift'
]);
FileTypeDetector.DOCUMENT_EXTENSIONS = new Set([
    '.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt', '.odt', '.ods', '.odp'
]);
class PathUtils {
    /**
     * Normalize file path for consistent comparison
     */
    static normalizePath(path) {
        return path.replace(/\\/g, '/').toLowerCase();
    }
    /**
     * Get relative path from base directory
     */
    static getRelativePath(fullPath, basePath) {
        const normalizedFull = this.normalizePath(fullPath);
        const normalizedBase = this.normalizePath(basePath);
        if (normalizedFull.startsWith(normalizedBase)) {
            return normalizedFull.substring(normalizedBase.length).replace(/^\//, '');
        }
        return normalizedFull;
    }
    /**
     * Extract filename without extension
     */
    static getBaseName(filename) {
        const parts = filename.split('.');
        return parts.length > 1 ? parts.slice(0, -1).join('.') : filename;
    }
    /**
     * Get file extension
     */
    static getExtension(filename) {
        const parts = filename.split('.');
        return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
    }
}
exports.PathUtils = PathUtils;
class TextPreprocessor {
    /**
     * Extract clean text from different file types
     */
    static preprocessText(text, options = {}) {
        let processed = text.toLowerCase();
        // Remove extra whitespace
        processed = processed.replace(/\s+/g, ' ').trim();
        if (options.removeNumbers) {
            processed = processed.replace(/\d+/g, '');
        }
        if (options.removePunctuation) {
            processed = processed.replace(/[^\w\s]/g, ' ');
        }
        if (options.minWordLength) {
            const words = processed.split(/\s+/);
            processed = words
                .filter(word => word.length >= (options.minWordLength || 1))
                .join(' ');
        }
        return processed;
    }
    /**
     * Extract keywords from text
     */
    static extractKeywords(text, maxKeywords = 10) {
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
            'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
        ]);
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.has(word));
        // Count word frequency
        const wordCount = new Map();
        words.forEach(word => {
            wordCount.set(word, (wordCount.get(word) || 0) + 1);
        });
        // Sort by frequency and return top keywords
        return Array.from(wordCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, maxKeywords)
            .map(([word]) => word);
    }
}
exports.TextPreprocessor = TextPreprocessor;
