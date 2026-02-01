// import { Moon, Sun, Monitor } from 'lucide-react'
// import { useTheme } from '@/contexts/ThemeContext'
// import { Button } from '@/components/ui/button'
// import {
//   Card,
//   CardContent,
// } from '@/components/ui/card'

// export function ThemeToggle() {
//   const { theme, setTheme } = useTheme()

//   const themes = [
//     { value: 'light' as const, icon: Sun, label: 'Light' },
//     { value: 'dark' as const, icon: Moon, label: 'Dark' },
//     { value: 'system' as const, icon: Monitor, label: 'System' },
//   ]

//   return (
//     <Card className="p-2">
//       <CardContent className="p-0">
//         <div className="flex gap-1">
//           {themes.map(({ value, icon: Icon, label }) => (
//             <Button
//               key={value}
//               variant={theme === value ? 'default' : 'ghost'}
//               size="sm"
//               onClick={() => setTheme(value)}
//               className="flex-1"
//               title={label}
//             >
//               <Icon className="h-4 w-4" />
//             </Button>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   )
// }
