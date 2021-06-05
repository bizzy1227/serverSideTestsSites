
const axios = require('axios');
const CONSTS = require('../consts');



const NeogaraGetConversions = async (startDate, page = 0, email) =>{
  let token;
  try {

    const requestToken = axios.create({
      baseURL: CONSTS.DEV_NEOGARA_CRM_URL,
      headers: {
          "accept": "application/json"
      }
    })

    await requestToken.post(
        '/auth/login', 
        {
          'username': CONSTS.DEV_NEOGARA_CREDENTIALS.username, 
          'password': CONSTS.DEV_NEOGARA_CREDENTIALS.password
        }
      )
      .then(res => {
        token = res.data.access_token
      })

    const request = axios.create({
      baseURL: CONSTS.DEV_NEOGARA_CRM_URL,
      headers: {
        "accept": "application/json",
        "authorization": `Bearer ${token}`,
      }
    })
    
    const userMail = await encodeURIComponent(email);

    startDate = await encodeURIComponent(startDate);
    console.log(startDate);

    // const limit = parseInt(options.limit) || 10
    let data = await request.get(`conversions?filter%5B0%5D=lid.email%7C%7C%24cont%7C%7C${userMail}&filter%5B1%5D=createdAt%7C%7C%24gte%7C%7C${startDate}&limit=25&page=${page}&sort%5B0%5D=id%2CDESC&offset=0`).then(res => {return res.data})
    let totals = {
      count: data.count,
      total: data.total,
      page: data.page,
      pageCount: data.pageCount
    }
    return data.data.map(l => {return {email: l.lid.email, device: l.lid.userAgent, ref: l.lid.ref, createdAt: l.lid.createdAt, totals: totals, phone: l.lid.phone}})
  } catch (error) {
    return error
  }
}

module.exports.NeogaraGetConversions = NeogaraGetConversions;

