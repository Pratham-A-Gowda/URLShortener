function nanoid(size=8){
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let s=''
  for(let i=0;i<size;i++) s+=chars[Math.floor(Math.random()*chars.length)]
  return s
}
module.exports = { nanoid }
