let objectsData = [];

window.onload = loadStuff();

function loadStuff () {
  loadProjects(0);
  activateButtons();
}

function loadProjects (mode) {
  let request = new XMLHttpRequest();
  request.open('get','https://api.github.com/users/antoniomsantos99/repos', true);
  request.send();
  request.onreadystatechange = function(){
    if (request.readyState === 4 && (request.status === 200 || request.status === 304)){
      listProjects(request.responseText,mode);
    }
    else console.log(request.status, objectsData);
  }
}

function listProjects (responseText,mode) {
  let responseObj = JSON.parse(responseText);
  if(objectsData.length==0){
    for (let i = 0; i < responseObj.length; i++) {
        let url;
        if(responseObj.has_pages){
          url = "/"+responseObj[i].name;
        }else{
          url = responseObj[i].html_url;
        }
        let tmp = {
          name: responseObj[i].name,
          isFork: responseObj[i].fork,
          stars: responseObj[i].stargazers_count,
          url: url,
          description: responseObj[i].description,
          has_pages: responseObj[i].has_pages,
          numCommits: -1,
          lastCmtDate: "",
        }
        if(!tmp.isFork){
          objectsData.push(tmp);
        }
    }
  }
  switch(mode){
    case 0: objectsData.sort(dateCompare);
        break;
    case 1: objectsData.sort(starCompare);
        break;
    case 2: objectsData.sort(commitCompare);
        break;
  }
  //if(mode<1){
    printProjects_split();
  /*}else{
    printProjects();
  }*/
  for (let i = 0; i < objectsData.length; i++) {
    setNumCommits(objectsData[i].name,i);
    setLastCommitDate(objectsData[i].name,i);
  }
}

function setNumCommits(name,repo) {
  let request = new XMLHttpRequest();
  request.open('get','https://api.github.com/repos/Mendess2526/'+name+'/contributors?anon=true');
  request.send();
  request.onreadystatechange = function(){
    if (request.readyState === 4 && (request.status === 200 || request.status === 304)){
      if(name!="Mendess2526.github.io"){
        let n = countCommits(JSON.parse(request.responseText));
        objectsData[repo].numCommits = n;
        document.getElementById('commits'+name).innerHTML = " #of commits: "+n;
      }
    }
    else console.log(request.status, objectsData);
  }
}

function setLastCommitDate (name,repo) {
  let request = new XMLHttpRequest();
  request.open('get','https://api.github.com/repos/Mendess2526/'+name+'/commits');
  request.send();
  request.onreadystatechange = function(){
    if (request.readyState === 4 && (request.status === 200 || request.status === 304)){
      let respTxt = JSON.parse(request.responseText);
      let n = respTxt[0].commit.author.date;
      objectsData[repo].lastCmtDate = n;
    }
    else console.log(request.status, objectsData);
  }
}

/*function printProjects () {
  let projBoxDiv = document.getElementById('project-box');
  projBoxDiv.innerHTML = "";
  let div = document.createElement('div');
  let ul = document.createElement('ul');
  div.classList.add('post-box');
  ul.classList.add('post-list');
  for(let i = 0; i < objectsData.length; i++){
    if(objectsData[i].name!="Mendess2526.github.io"){
      let li = buildRepoHtml(objectsData[i]);
      ul.appendChild(li);
    }
  }
  div.appendChild(ul);
  projBoxDiv.appendChild(div);
}*/

function printProjects_split () {
  let projBoxDiv = document.getElementById('project-box');
  projBoxDiv.innerHTML = "";
  let divMain = document.createElement('div');
  let mainH2 = document.createElement('h2');
  let ulMain = document.createElement('ul');
  divMain.classList.add('post-box');
  ulMain.classList.add('post-list');
  mainH2.innerHTML = "Main Projects";
  divMain.appendChild(ulMain);
  projBoxDiv.appendChild(mainH2);
  projBoxDiv.appendChild(divMain);


  let divSecond = document.createElement('div');
  let secondH2 = document.createElement('h2');
  let ulSecond = document.createElement('ul');
  divSecond.classList.add('post-box');
  secondH2.innerHTML = "Secondary Projects";
  ulSecond.classList.add('post-list');
  divSecond.appendChild(ulSecond);
  projBoxDiv.appendChild(secondH2);
  projBoxDiv.appendChild(divSecond);
  for(let i = 0; i < objectsData.length; i++){
    if(objectsData[i].name!="Mendess2526.github.io"){
      let li = buildRepoHtml(objectsData[i]);
      if(objectsData[i].has_pages){
        ulMain.appendChild(li);
      }else{
        ulSecond.appendChild(li);
      }
    }
  }
}

function buildRepoHtml(repo) {
  let li = document.createElement('li');
  let headerH2  = buildHeader(repo);
  let descP     = buildDescription(repo);
  let footerDiv = buildFooter(repo);
  li.classList.add('post-item');
  li.appendChild(headerH2);
  li.appendChild(descP);
  li.appendChild(footerDiv);

  return li;
}

function buildHeader (repo) {
  //create elements
  let h2 = document.createElement('h2');
  let a = document.createElement('a');
  let i = document.createElement('i');
  //add CSS classes and oher atributes
  h2.classList.add('post-header');
  a.classList.add('post-link');
  a.href = repo.url;
  i.className = 'fa fa-long-arrow-right';
  i.setAttribute('aria-hidden','true');
  //add content
  a.innerHTML = repo.name + " ";
  a.appendChild(i);
  h2.appendChild(a);

  return h2;
}

function buildDescription (repo) {
  //create elements
  let p = document.createElement('p');
  //add CSS classes and oher atributes
  p.classList.add('post-description');
  //add content
  p.innerHTML = repo.description;
  return p;
}

function buildFooter (repo) {
  //create elements
  let div = document.createElement('div');
  let span1 = document.createElement('span');
  let span2 = document.createElement('span');
  let span3 = document.createElement('span');
  //add CSS classes and oher atributes
  div.classList.add('article-list-footer');
  span1.className = 'article-list-date divider';
  span2.className = 'article-list-date divider';
  span3.classList.add('article-list-minutes');
  span3.setAttribute('id','commits'+repo.name);
  //add content
  span1.innerHTML = "Stars:"+repo.stars+"⭐ ";
  if(repo.has_pages){
    span2.innerHTML = " Project page: ✔️ ";
  }else{
    span2.innerHTML = " Project page: ❌ ";
  }
  div.appendChild(span1);
  div.appendChild(span2);
  div.appendChild(span3);

  return div;
}

function countCommits (response) {
  let count = 0;
  for (let i = 0; i < response.length; i++) {
    count += response[i].contributions;
  }
  return count;
}

function dateCompare (a,b) {
  let dateA = new Date(a.lastCmtDate);
  let dateB = new Date(b.lastCmtDate);
  return dateB -  dateA;
}

function starCompare(a,b){
  return b.stars - a.stars;
}

function commitCompare (a,b) {
  return b.numCommits - a.numCommits;
}

function sortByStars () {
  loadProjects(1);
}

function sortByCommits () {
  loadProjects(2);
}

function defaultSort () {
  loadProjects(0);
}
// this function is never called, I still have to figure out how to use this
function activateButtons(){
  document.getElementById('bStars').setAttribute('onclick','sortByStars()');
  document.getElementById('bCommits').setAttribute('onclick','sortByCommits()');
  document.getElementById('bDefault').setAttribute('onclick','defaultSort()');
}