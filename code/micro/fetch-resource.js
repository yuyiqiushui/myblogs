import fetch from 'fetch'
export const fetchResource = url => fetch(url).then(res => res.text())
