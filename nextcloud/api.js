function parseDirectories(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  const responses = xmlDoc.getElementsByTagName("d:response");
  const directoryPaths = [];

  for (let i = 1; i < responses.length; i++) {
    const href = responses[i].getElementsByTagName("d:href")[0].textContent;
    const resourceType = responses[i].getElementsByTagName("d:resourcetype")[0];
    const isDirectory = resourceType.getElementsByTagName("d:collection").length > 0
    directoryPaths.push({ href, isDirectory });
  }
  return directoryPaths;
};

export default {
  listDirectories(path='/',USER_NAME = 'null',USER_PASS = 'null') {
    const propfindXML = `<?xml version="1.0"?>
    <d:propfind xmlns:d="DAV:">
      <d:prop>
        <d:resourcetype/>
      </d:prop>
    </d:propfind>`;
    return axios({
      url:'/remote.php/dav/files/'+USER_NAME+path,
      method: 'PROPFIND',
      auth: {
        username: USER_NAME,
        password: USER_PASS
      },
      headers: {
        // 'Authorization': 'Basic ' + btoa(`${USER_NAME}:${USER_PASS}`),
        'Content-Type': 'application/xml; charset=utf-8',
        'Depth': '1'
      },
      data: propfindXML
    }).then(response => parseDirectories(response.data));
  },
  getFile(filePath, rangeStart, rangeEnd, USER_NAME = 'null',USER_PASS = 'null') {
    var headers = {'Authorization': 'Basic ' + btoa(`${USER_NAME}:${USER_PASS}`)};
    if (rangeStart !== undefined && rangeEnd !== undefined) {
      headers['Range'] = `bytes=${rangeStart}-${rangeEnd}`;
    } else if (rangeStart !== undefined) {
      headers['Range'] = `bytes=${rangeStart}-`;
    }
    console.log(filePath);
    return axios({
      method: 'GET',
      url: filePath,
      headers,
      responseType: 'blob'  // Important for binary files like images, videos, etc.
    });
    // .then(response => {      
    //   response.data;
    // });
  }
};
