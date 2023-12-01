const express = require("express");
const path = require("path");
const app = express();
const PORT = 5000;
const dateDuration = require("./src/helper/duration");

const config = require("./src/config/config.json");
const { Sequelize, QueryTypes } = require("sequelize");
const { log } = require("console");
const sequelize = new Sequelize(config.development);

// setup call hbs with sub folder
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "src/views"));

// set serving static file
app.use(express.static(path.join(__dirname, "src/assets")));

// parsing data from client
app.use(express.urlencoded({ extended: false }));

// routing
app.get("/", home);

app.get("/blog", blog);
app.post("/blog", addBlog);

app.get("/testimonial", testimonial);
app.get("/contact", contact);
app.get("/blog-detail/:id", blogDetail);
app.get("/form-blog", formBlog);

app.get("/delete-blog/:id", deleteBlog);
app.get("/edit-blog/:id", viewEditBlog);
app.post("/edit-blog/:id", updateBlog);
// app.post('/form-blog', addBlog)

let dataBlog = [];

// local server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// index
async function home(req, res) {
  try {
    const query = `SELECT * FROM projects`;
    let obj = await sequelize.query(query, { type: QueryTypes.SELECT });
    let dataBlogRes = obj.map((item) => {
      return {
        ...item,
        duration: dateDuration(item.startDate, item.endDate),
        techs: viewIcon(item.technologies),
      };
    });
    console.log("render data home:", dataBlogRes);
    res.render("index", { dataBlog: dataBlogRes });
  } catch (err) {
    console.log(err);
  }
}

// blog
function blog(req, res) {
  res.render("blog");
}

// form blog
function formBlog(req, res) {
  res.render("form-blog");
}

// contact me
function contact(req, res) {
  res.render("contact");
}

//testimonial
function testimonial(req, res) {
  res.render("testimonial");
}
// blog detail
async function blogDetail(req, res) {
  try {
    const { id } = req.params;

    const query = `SELECT * FROM projects WHERE id=${id}`;
    let obj = await sequelize.query(query, { type: QueryTypes.SELECT });

    obj.forEach((item) => {
      item.duration = dateDuration(item.startDate, item.endDate);
      item.techs = viewIconHbs(item.technologies);
    });

    console.log(obj);
    res.render("blog-detail", { blog: obj[0] });
  } catch (err) {
    console.log(err);
  }
  // const { id } = req.params;

  // res.render("blog-detail", { blog: dataBlog[id] });
}

// add a new blog
async function addBlog(req, res) {
  try {
    let image = "luffy.jpg";

    let { tittle, startDate, endDate, content, nodejs, js, react, vuejs } =
      req.body;
    console.log(tittle);
    console.log(startDate);
    console.log(endDate);
    console.log(content);
    console.log(nodejs);
    console.log(js);
    console.log(react);
    console.log(vuejs);
    console.log(image);

    let techs = { nodejs, js, react, vuejs };
    let technologies = techArray(techs);
    console.log(technologies);
    // check which technologies are selected and add them to the database

    const query = `INSERT INTO projects (tittle,content, "startDate", "endDate", technologies,image) VALUES ('${tittle}','${content}', '${startDate}', '${endDate}', ARRAY[${technologies}],'${image}')`;
    await sequelize.query(query, { type: QueryTypes.INSERT });

    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
}

// view edit Blog with index/id
async function viewEditBlog(req, res) {
  try {
    const { id } = req.params;

    const query = `SELECT * FROM projects WHERE id = ${id}`;
    let obj = await sequelize.query(query, { type: QueryTypes.SELECT });

    obj.forEach((item) => {
      let array = item.technologies;

      item.nodejs = false;
      item.js = false;
      item.react = false;
      item.vuejs = false;

      for (let i = 0; i < array.length; i++) {
        if (array[i] === "nodejs") {
          item.nodeJs = true;
        } else if (array[i] === "js") {
          item.js = true;
        } else if (array[i] === "react") {
          item.react = true;
        } else if (array[i] === "vuejs") {
          item.vuejs = true;
        }
      }
    });
    console.log(obj);
    res.render("edit-blog", { edit: obj[0] });
  } catch (err) {
    console.log(err);
  }
}

// edit blog
async function updateBlog(req, res) {
  try {
    let image = "zoro.jpg";

    const { id } = req.params;
    const { tittle, content, startDate, endDate, nodejs, js, react, vuejs } =
      req.body;

    console.log(
      tittle,
      content,
      startDate,
      endDate,
      nodejs,
      js,
      react,
      vuejs,
      image
    );

    let techs = { nodejs, js, react, vuejs };
    let technologies = techArray(techs);
    console.log(technologies);
    // check which technologies are selected and add them to the database
    const query = `UPDATE projects SET tittle = '${tittle}', content = '${content}', "startDate" = '${startDate}', "endDate" = '${endDate}', technologies = ARRAY[${technologies}], image = '${image}' WHERE id = ${id}`;

    await sequelize.query(query, { type: QueryTypes.UPDATE });
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
}

async function deleteBlog(req, res) {
  try {
    const { id } = req.params;

    await sequelize.query(`DELETE FROM projects WHERE id = ${id}`);

    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
}

function viewIcon(icon) {
  let codeIcon = "";

  for (i = 0; i < icon.length; i++) {
    if (icon[i] == "nodejs") {
      codeIcon += `<i class="fa-brands fa-node-js"></i>`;
    } else if (icon[i] == "js") {
      codeIcon += `<i class="fa-brands fa-js"></i>`;
    } else if (icon[i] == "react") {
      codeIcon += `<i class="fa-brands fa-react"></i>`;
    } else if (icon[i] == "vuejs") {
      codeIcon += `<i class="fa-brands fa-vuejs"></i>`;
    }
  }

  return codeIcon;
}

function viewIconHbs(icon) {
  let codeIcon = "";

  for (i = 0; i < icon.length; i++) {
    if (icon[i] == "nodejs") {
      codeIcon += `<i class="fa-brands fa-node-js" style="font-size: 80px; margin-right: 8px;"></i>`;
    } else if (icon[i] == "js") {
      codeIcon += `<i class="fa-brands fa-js" style="font-size: 80px; margin-right: 8px;"></i>`;
    } else if (icon[i] == "react") {
      codeIcon += `<i class="fa-brands fa-react" style="font-size: 80px; margin-right: 8px;"></i>`;
    } else if (icon[i] == "vuejs") {
      codeIcon += `<i class="fa-brands fa-vuejs" style="font-size: 80px; margin-right: 8px;"></i>`;
    }
  }

  return codeIcon;
}

function techArray(techs) {
  let technologies = [];

  if (techs.nodejs == "nodejs") {
    technologies.push(`'nodejs'`);
  }
  if (techs.js == "js") {
    technologies.push(`'js'`);
  }
  if (techs.react == "react") {
    technologies.push(`'react'`);
  }
  if (techs.vuejs == "vuejs") {
    technologies.push(`'vuejs'`);
  }

  return technologies;
}
