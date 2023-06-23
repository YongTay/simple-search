
import { exec } from 'child_process'

exec('cp manifest.json simple-search/', (err,std) => {
  if (err) {
    console.log(err)
    return
  }
  console.log(std)
})
exec('cp background.js simple-search/')
exec('cp dist/index.js simple-search/dist/')
exec('cp -r assets simple-search/')
