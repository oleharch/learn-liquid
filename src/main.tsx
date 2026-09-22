import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Link, Navigate, RouterProvider } from 'react-router-dom'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import './styles/app.css'
import { Shell } from './components/Shell'
import { Home } from './pages/Home'
import { CourseMap, LessonPage } from './pages/Course'
import { DocPageView, DocsIndex } from './pages/Docs'
import { ShopifyReference } from './pages/ShopifyReference'
import { Playground } from './pages/Playground'
import { Interview } from './pages/Interview'
import { Cheatsheet } from './pages/Cheatsheet'

function NotFound() {
  return (
    <div className="page">
      <p className="eyebrow">404</p>
      <h1>Такої сторінки немає</h1>
      <p className="page__lead">Можливо, розділ ще пишеться або адреса застаріла.</p>
      <p><Link to="/" className="btn btn--primary">На головну</Link></p>
    </div>
  )
}

const router = createBrowserRouter([
  {
    element: <Shell />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/learn', element: <CourseMap /> },
      { path: '/learn/:id', element: <LessonPage /> },
      { path: '/docs', element: <DocsIndex /> },
      { path: '/docs/:section/:slug', element: <DocPageView /> },
      { path: '/shopify', element: <DocsIndex sections={['shopify']} shopify /> },
      { path: '/shopify/reference', element: <ShopifyReference /> },
      { path: '/playground', element: <Playground /> },
      { path: '/interview', element: <Interview /> },
      { path: '/cheatsheet', element: <Cheatsheet /> },
      { path: '/about', element: <Navigate to="/docs/basics/sandbox" replace /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(<StrictMode><RouterProvider router={router} /></StrictMode>)
