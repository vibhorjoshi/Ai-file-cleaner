import { FileScanner, DuplicateGroups, ProgressStats } from '@ai-file-cleanup/ui'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI File Cleanup
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Intelligent duplicate detection using advanced ML embeddings for text, images, and exact file matching
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <FileScanner />
            <div className="mt-8">
              <DuplicateGroups />
            </div>
          </div>
          <div>
            <ProgressStats />
          </div>
        </div>
      </div>
    </main>
  )
}