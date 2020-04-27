import axios from 'axios'

const address = 'http://caar-api.us-east-1.elasticbeanstalk.com/';
export const register = newUser => {
  return axios
    .post(address + 'createaccount', {
      newAccountEmail: newUser.email,
      newAccountPassword: newUser.password
    })
    .then(response => {
      if(response.data.session_token){
        localStorage.setItem('usertoken', response.data.session_token)
      }
      return response.data
    }).catch(err =>{
      //console.log(err)
    })
}

export const login = user => {
  return axios.post(address + 'login', {
    email: user.email,
    password: user.password
  }).then(response => {
    console.log(response.data);
      localStorage.setItem('usertoken', response.data.session_token)
      console.log(localStorage.usertoken);
      return response.data
    }).catch(err => {
      console.log(err)
    })
}

export const saveNewQuery = data => {
  return axios.post(address + 'savenewquery', {
    queryName: data.save_name,
    queryContent: {
    any: data.any,
    exact: data.exact,
    not: data.none,
    all: data.all,
    within: data.within,
    withinNum: Number(data.withinNum),
    startYear: data.from,
    endYear: data.to,
    newspapers: data.newspapers,
    states: data.states
    },
    sessionToken: localStorage.usertoken
  }).then(response => {
      return response.data
    }).catch(err => {
      console.log(err)
    })
}

export const queryAllData = data => {
  return axios.post(address + 'queryalldata', {
    any: data.any,
    exact: data.exact,
    not: data.none,
    all: data.all,
    within: data.within,
    withinNum: Number(data.withinNum),
    startYear: data.from,
    endYear: data.to,
    newspapers: data.newspapers,
    states: data.states
  }).then(response => {
    return response.data;
  }).catch(err => {
    console.log(err)
  })
}

export const getNewspapers  = () =>{
  return axios.post(address + 'getnewspapers').then(response => {
    return response.data;
  }).catch(err => {
    console.log(err);
  })
}

export const deleteUserQuery = data => {
  return axios.post(address + 'deleteuserquery', {
    sessionToken: data.token,
    queryIDToDelete: data.id
  }).then(response => {
      return response.data
    }).catch(err => {
      console.log(err)
    })
}
export const modifyUserQuery = data => {
  return axios.post(address + 'modifyuserquery', {
    sessionToken: data.token,
    queryIDToChange: data.id,
    newQueryName: data.name
  }).then(response => {
      return response.data
    }).catch(err => {
      console.log(err)
    })
}


export const getProfile = tokenValue => {
 
  return axios
    .get(address, {
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
    .get(address).then(response => {
      return response.data
    })
    .catch(err => {
      console.log(err)
    })
}

export const recallUserQueries = data => {
 
  return axios
    .post(address + 'recalluserqueries', {
      sessionToken: data,  
    }).then(response => {
      return response.data
    })
    .catch(err => {
      console.log(err)
    })
}

export const simpleSearch = form => {
  return axios
    .get(address, {
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
    .get(address, {
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
    .get(address, {
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
    .post(address, {
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
    .post(address, {
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

export const checkPermissions = (data) => {
  return axios.post(address + 'checkpermissions', {
    sessionToken: data.token
  }).then(res => {
    return res.data
  }).catch(err => {
    console.log(err)
  })
}

export const changeUserPermissions = (data) => {
  return axios.post(address + 'changeuserpermissions', {
    sessionToken: data.token,
    emailToChange: data.email,
    isPromoted: data.promoted
  }).then(res => {
    return res.data
  }).catch(err => {
    console.log(err)
  })
}

export const getAllUsers = (data) => {
  return axios.post(address + 'getallusers', {
    sessionToken: data.token
  }).then(res => {
    return res.data
  }).catch(err => {
    console.log(err)
  })
}

