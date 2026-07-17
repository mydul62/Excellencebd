import {
  Atom,
  BookOpen,
  Calculator,
  Code,
  FlaskConical,
  Globe,
  GraduationCap,
  Leaf,
  type LucideIcon,
  Palette,
  School,
  Sigma,
  Terminal,
} from 'lucide-react'

export const courseIconMap: Record<string, LucideIcon> = {
  code: Code,
  'graduation-cap': GraduationCap,
  atom: Atom,
  'book-open': BookOpen,
  calculator: Calculator,
  'flask-conical': FlaskConical,
  palette: Palette,
  school: School,
  globe: Globe,
  sigma: Sigma,
  terminal: Terminal,
  leaf: Leaf,
}

export function getCourseIcon(key: string): LucideIcon {
  return courseIconMap[key] ?? BookOpen
}
