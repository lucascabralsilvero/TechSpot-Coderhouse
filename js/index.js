const d = document; 

/* Empieza carrito */

document.addEventListener("DOMContentLoaded", () =>{
    fetchData();
}); 


/********* Open Cart Modal *********/ 

// Constantes:
const cart = d.getElementById("cart");
const cartModalOverlay = d.querySelector(".cart-modal-overlay");

// Eventos:

cart.addEventListener("click",() => {
    if(cartModalOverlay.style.transform === "translateX(-200%)"){
        cartModalOverlay.style.transform = "translateX(0)";
    } else{
        cartModalOverlay.style.transform = "translateX(-200%)";
    }
});

/********* Close Cart Modal *********/ 

const closeBtn = d.getElementById('close-btn');

closeBtn.addEventListener('click', () => {
  cartModalOverlay.style.transform = 'translateX(-200%)';
});

cartModalOverlay.addEventListener("click", (e) => {
  if (e.target.classList.contains('cart-modal-overlay')){
    cartModalOverlay.style.transform = 'translateX(-200%)'
}
})


// https://www.javascripttutorial.net/javascript-fetch-api/#:~:text=The%20Fetch%20API%20allows%20you,text()%20or%20json()%20.

const fetchData = async() => {
    try{
        const res = await fetch("./productos.json");
        const data = await res.json(); 
        console.log(data); 
        mostrarProductos(data);
        detectarBotones(data);  
    } catch(error){
        console.log(error);
    }
}


//  Mostrar datos en el HTML; 

// Declarar constante del contenedor; 

const contenedorProductos = d.getElementById("contenedor-productos");

const mostrarProductos = (data) => {

    const template = d.getElementById("template-productos").content;

    const fragment = d.createDocumentFragment(); 

    //Recorremos Data; 

    data.forEach(producto => {
        // img
        template.querySelector("img").setAttribute("src", producto.imageUrl);
        // title
        template.querySelector("h6").textContent = producto.title;
        // price
        template.querySelector("span").textContent = producto.price;
        // Description
        template.querySelector("p").textContent = producto.description;
        // Button
        template.querySelector("button").dataset.id = producto.id;
        // Clonamos
        const clone = template.cloneNode(true); 

        fragment.appendChild(clone); 

    })
    contenedorProductos.appendChild(fragment); 
}

let carrito = {};

//  Detectar botones;

const detectarBotones = (data) => {
    const botones = document.querySelectorAll(".card button");
    botones.forEach(btn => {
        btn.addEventListener("click", () => {
            const producto = data.find(item => item.id === parseInt(btn.dataset.id));
            producto.cantidad = 1;
            if(carrito.hasOwnProperty(producto.id)){
                producto.cantidad = carrito[producto.id].cantidad + 1;
            }
            carrito[producto.id] = {...producto};

            llenarCarrito();
        })
    })
}

// Capturar items en el carrito; 

const items = d.getElementById("items");

const llenarCarrito = () => {

    // Limpiar antes de ciclo
    items.innerHTML = "";

    const template = d.getElementById("template-carrito").content;
    const fragment = d.createDocumentFragment();

    Object.values(carrito).forEach(producto => {

        console.log(producto);
        template.querySelectorAll("td")[0].querySelector("img").setAttribute("src", producto.imageUrl);
        template.querySelectorAll("td")[1].textContent = producto.title;
        template.querySelectorAll("td")[2].textContent = producto.cantidad;
        template.querySelector("span").textContent = producto.precio * producto.cantidad;

        const clone = template.cloneNode(true); 
        fragment.appendChild(clone);
    })

    items.appendChild(fragment);
}