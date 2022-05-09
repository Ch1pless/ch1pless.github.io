
let currSize = "";

let projectList = [];
let projectFolders = ["gold_ratio", "matrix", "path_algos", "sort", "spacefighters"];

let projContainer = document.querySelector(".projects-container");


function ProjectCard(size="normal", props={href: "", imgsrc: "", imgalt: "", title: "", description: ""}) {
    console.log("Generating Project Card for " + props.title + ".");

    if (props.href == "") {
        props.href = "#";
        props.imgsrc = "images/logo.png";
        props.imgalt = "Default Image";
        props.title = "Default Card";
        props.description = "Default card, should not be visible normally.";
    }

    let card = document.createElement("a");
    card.classList.add("card", "text-decoration-none", "text-reset", "shadow", "w-card", "page-color");
    card.href = props.href;

    let cardImgContainer = document.createElement("div");

    let cardImg = document.createElement("img");
    cardImg.src = props.imgsrc;
    cardImg.alt = props.imgalt;

    let cardTitle = document.createElement("h5");
    cardTitle.classList.add("card-title");
    cardTitle.innerHTML = props.title;

    let cardBody = document.createElement("div");

    if (size=="normal") {
        cardImgContainer.classList.add("card-header", "p-0");
        cardImg.classList.add("card-img-top");

        let cardText = document.createElement("p");
        cardText.classList.add("card-text");
        cardText.innerHTML = props.description;

        cardBody.classList.add("card-body");

        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardText);

        cardImgContainer.appendChild(cardImg);

        card.appendChild(cardImgContainer);
        card.appendChild(cardBody);
    } else {
        cardImgContainer.classList.add("col-4", "card-sider");
        cardImg.classList.add("w-100");

        let cardRow = document.createElement("div");
        cardRow.classList.add("row", "g-0");

        cardBody.classList.add("col-8", "d-flex", "align-items-center", "justify-content-center", "text-center");

        cardBody.appendChild(cardTitle);

        cardImgContainer.appendChild(cardImg);

        cardRow.appendChild(cardImgContainer);
        cardRow.appendChild(cardBody);

        card.appendChild(cardRow);
    }

    return card;
}

function FillProjectContainer() {
    if (projectList.length == 0) {
        generateProjectList();
        return;
    }

    let size = window.innerWidth <= 768 ? "small" : "normal";
    if (size == currSize) return;
    console.log("Generating Project Cards.");
    // Clear Project Container
    while (projContainer.lastChild)
        projContainer.removeChild(projContainer.lastChild);
    
    for (let project of projectList)
        projContainer.appendChild(ProjectCard(size, project));

    currSize = size;
}

function generateProjectList() {
    if (projectList.length != 0) return;

    console.log("Generating Projects List.");
    projectList = [];

    let promises = [];
    for (let folder of projectFolders) {
        promises.push(new Promise((resolve, reject) => {
            $.ajax({
                method: "GET",
                url: "./projects/" + folder + "/info.json",
                success: response => {
                    console.log("Located information for " + folder + ".");
                    projectList.push(response);
                    resolve();
                },
                failure: () => {
                    reject();
                },
            })
        } 
        ));
    }
    Promise.all(promises).then(FillProjectContainer);
}

window.addEventListener("load", generateProjectList, true);

window.addEventListener("resize", FillProjectContainer, true);