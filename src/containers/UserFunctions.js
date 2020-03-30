import axios from 'axios'

export const register = newUser => {
  return axios
    .post('/api/register', {
      name: newUser.name,
      email: newUser.email,
      password: newUser.password
    })
    .then(response => {
      if(response.data.token){
        localStorage.setItem('usertoken', response.data.token)
      }
      return response.data
    }).catch(err =>{
      //console.log(err)
    })
}

export const login = user => {
  return axios.post('/api/login', user).then(response => {
      localStorage.setItem('usertoken', response.data.token)
      return response.data
    }).catch(err => {
      console.log(err)
    })
}

export const saveQuery = data => {
  return axios.post('/api/saveQuery', data).then(response => {
      return response.data
    }).catch(err => {
      console.log(err)
    })
}

export const deleteQuery = data => {
  return axios.post('/api/deleteQuery', data).then(response => {
      return response.data
    }).catch(err => {
      console.log(err)
    })
}
export const saveQueryName = data => {
  return axios.post('/api/saveQueryName', data).then(response => {
      return response.data
    }).catch(err => {
      console.log(err)
    })
}


export const getProfile = tokenValue => {
 
  return axios
    .get('http://127.0.0.1:8000/api/profile', {
      params:{
        token: tokenValue
      }
    }).then(response => {
      return response.data
    })
    .catch(err => {
      console.log(err)
    })
}

export const getHeatmapData = data => {
 
  return axios
    .get('http://127.0.0.1:8000/api/heatmap').then(response => {
      return response.data
    })
    .catch(err => {
      console.log(err)
    })
}

export const getUserQueries = data => {
 
  return axios
    .get('http://127.0.0.1:8000/api/getUserQueries', {
      params:{
        token: data.tokenValue, 
        page: data.page
      }
    }).then(response => {
      return response.data
    })
    .catch(err => {
      console.log(err)
    })
}

export const simpleSearch = form => {
  return axios
    .get('/api/search', {
      params:{
        from: form.from,
        to: form.to,
        search_terms: form.search_terms,
        page: form.page,
        per_page: form.per_page,
        sortBy: form.sortBy,
        sortOrder: form.sortOrder,
        field: form.field
      }
    }).then(response => {
      return response.data.response
    })
    .catch(err => {
      console.log(err)
    })
}

export const getDetails = article => {
  return axios
    .get('/api/details', {
      params:{
        article_id: article
      }
    }).then(response => {
      return response.data
    })
    .catch(err => {
      console.log(err)
    })
}

export const advanceSearch = form => {
  return axios
    .get('/api/advanceSearch', {
      params:{
        city: form.city,
        state: form.state,
        newspaper: form.newspaper,
        publisher: form.publisher,
        from: form.from,
        to: form.to,
        include_any: form.include_any,
        include_all: form.include_all,
        not_include_any: form.not_include_any,
        include_phrase: form.include_phrase,
        include_these: form.include_these,
        include_these2: form.include_these2,
        within: form.within,
        page: form.page,
        per_page: form.per_page,
        sortBy: form.sortBy,
        sortOrder: form.sortOrder,
        field: form.field
      }
    }).then(response => {
      return response.data.response
    })
    .catch(err => {
      console.log(err)
    })
}

export const forgot = user => {
  return axios
    .post('/api/forgot', {
      email: user.email
    })
    .then(res => {
      return res.data
    }).catch(err => {
      console.log(err)
    }) 
}

export const reset = user => {
  return axios
    .post('/api/reset', {
      password: user.password,
      token: user.token
    })
    .then(res => {
      return res.data
    }).catch(err => {
      console.log(err)
    })
}




export const dataURLtoBlob = (dataurl) =>{
  var parts = dataurl.split(','), mime = parts[0].match(/:(.*?);/)[1]
  if(parts[0].indexOf('base64') !== -1) {
      var bstr = atob(parts[1]), n = bstr.length, u8arr = new Uint8Array(n)
      while(n--){
          u8arr[n] = bstr.charCodeAt(n)
      }

      return new Blob([u8arr], {type:mime})
  } else {
      var raw = decodeURIComponent(parts[1])
      return new Blob([raw], {type: mime})
  }
}