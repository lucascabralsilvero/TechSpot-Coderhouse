const d = document; 

/* Empieza carrito */

document.addEventListener("DOMContentLoaded", () =>{
    fetchData();
    searchFilters(".search-input","#card-container");

    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'))
        llenarCarrito()
    }
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
        // console.log(data); 
        mostrarProductos(data);
        actualizarProductos(data);
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
    template.querySelectorAll("p")[0].textContent = producto.description;
    // Categoria
    template.querySelectorAll("p")[1].textContent = producto.categoria;
    // Button
    template.querySelector("button").dataset.id = producto.id;
    // Clonamos
    const clone = template.cloneNode(true); 
    fragment.appendChild(clone);      
    contenedorProductos.appendChild(fragment)

})  


 
}

const actualizarProductos = (data) => {

    const priceInput = d.querySelector(".price-filter");
    const priceValue = d.querySelector(".price-value"); 

    // Precio máximo
    let maxPrice  = data.map((item) => item.price);
    maxPrice = Math.max(...maxPrice);
    let minPrice  = data.map((item) => item.price);
    minPrice = Math.min(...minPrice);
    console.log(minPrice)
    priceInput.value = maxPrice; 
    priceInput.max = maxPrice; 
    priceInput.min = 0; 
    priceValue.textContent = `$${maxPrice}`;

    const template = d.getElementById("template-productos").content;

    const fragment = d.createDocumentFragment(); 


   priceInput.addEventListener("input", () => {
        contenedorProductos.innerHTML= "";
        data.forEach(producto => {
            const value = +(priceInput.value); 
            // Actualizo el precio 
            priceValue.textContent = `$${value}`;
            if(producto.price <= value){
                // img
                template.querySelector("img").setAttribute("src", producto.imageUrl);
                // title
                template.querySelector("h6").textContent = producto.title;
                // price
                template.querySelector("span").textContent = producto.price;
                // Description
                template.querySelectorAll("p")[0].textContent = producto.description;
                // Categoria
                template.querySelectorAll("p")[1].textContent = producto.categoria;
                // Button
                template.querySelector("button").dataset.id = producto.id;
                // Clonamos
                const clone = template.cloneNode(true); 
                fragment.appendChild(clone); 
           contenedorProductos.appendChild(fragment);  
            }

            if( value <= minPrice){
                contenedorProductos.innerHTML = `
                <img class= "empty-img" src ="./images/productos/empty/empty.png">
                <h3 class = "empty text-center">Ningún producto coincide con tus criterios de búsqueda!</h3>`

                if(d.body.classList.contains("dark")){
                    contenedorProductos.innerHTML = `
                <img class= "empty-img" src ="./images/productos/empty/empty-white.png">
                <h3 class = "empty-dark text-center">Ningún producto coincide con tus criterios de búsqueda!</h3>`
                }
           }
        })
     detectarBotones(data);
    })   
}


let carrito = {};

//  Detectar botones;

const detectarBotones = (data) => {
    const botones = document.querySelectorAll(".card button");
    
    botones.forEach(btn => {
        btn.addEventListener("click", () => {
            Swal.fire({
                title: "Producto agregado",
                icon:"success",
                timer: 1000,
                showConfirmButton:false,
                toast:true,
                position: "bottom",
            })
            const producto = data.find(item => item.id === parseInt(btn.dataset.id));
            producto.cantidad = 1;
            if(carrito.hasOwnProperty(producto.id)){
                producto.cantidad = carrito[producto.id].cantidad + 1;
            }
            carrito[producto.id] = {...producto};
            console.log(producto)
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

       
        template.querySelectorAll("td")[0].querySelector("img").setAttribute("src", producto.imageUrl);
        template.querySelectorAll("td")[1].textContent = producto.title;
        template.querySelectorAll("td")[2].textContent = producto.cantidad;
        template.querySelector("span").textContent = producto.price * producto.cantidad;

        // Botones
        template.querySelector(".btn-info").dataset.id = producto.id; 
        template.querySelector(".btn-danger").dataset.id = producto.id; 

        const clone = template.cloneNode(true); 
        fragment.appendChild(clone);
    })

    items.appendChild(fragment);

    mostrarFooter();
    accionBtn();

    localStorage.setItem('carrito', JSON.stringify(carrito))
}

const footer = d.getElementById("footer-carrito"); 
const quantity = d.getElementById("cart-quantity");
const mostrarFooter = () => {
    footer.innerHTML = "";
    
    // Contar si existen elementos

    if (Object.keys(carrito).length === 0){
        footer.innerHTML = `
        <th scope="row" class="text-center" colspan="5">Carrito vacío - comience a comprar!</th>
        `
        return
    }

    const template = d.getElementById("template-footer").content;
    const fragment = d.createDocumentFragment(); 

    // Sumar cantidad y totales

    let nCantidad = Object.values(carrito).reduce((acc,{cantidad}) => acc + cantidad, 0)
    console.log(nCantidad);
    const nPrecio = Object.values(carrito).reduce((acc,{cantidad,price}) => acc + cantidad * price,0)
    // console.log(nPrecio);
    template.querySelectorAll("td")[0].textContent = nCantidad;
    template.querySelector("span").textContent = nPrecio;

    const clone = template.cloneNode(true); 
      fragment.appendChild(clone); 

      footer.appendChild(fragment); 

    //   Vaciar carrito
      const boton = d.getElementById("vaciar-carrito");
      boton.addEventListener("click",()=>{
         carrito = {};
        //console.log(carrito);
          llenarCarrito();
          nCantidad = 0;
        //console.log(nCantidad)
          quantity.innerHTML = `${nCantidad}`;
          Swal.fire({
            title:"¡Carrito vaciado correctamente!",
            icon: "warning",
            showConfirmButton: false,
            timer:2000,
          })
          setTimeout(() => {
            cartModalOverlay.style.transform = 'translateX(-200%)';
        }, 2000);
      })
      quantity.innerHTML = `${nCantidad}`

      // Botón compra

    const comprar = d.getElementById("comprar");

    comprar.addEventListener("click", () => {
        carrito= {};
        llenarCarrito();
        nCantidad= 0;
        quantity.innerHTML = `${nCantidad}`;
       Swal.fire({
        icon: "success",
        title: "¡Gracias, su compra fue realizada con éxito!",
        showConfirmButton: false,
        timer:2000,
       })
       setTimeout(() => {
           cartModalOverlay.style.transform = 'translateX(-200%)';
       }, 2000);

    })
}

// Botones agregar y eliminar
const accionBtn = () => {
// Accedemos a los botones
const btnAgregar = d.querySelectorAll("#items .btn-info");
const btnEliminar = d.querySelectorAll("#items .btn-danger");

btnAgregar.forEach(btn => {btn.addEventListener("click",()=>{
        // Detectamos el producto
        const producto = carrito[btn.dataset.id];
        producto.cantidad++; 
      carrito[btn.dataset.id]={...producto};
        llenarCarrito();
})})

btnEliminar.forEach(btn =>{btn.addEventListener("click",() =>{
    const producto = carrito[btn.dataset.id];
    producto.cantidad--;
    if(producto.cantidad === 0){
        delete carrito[btn.dataset.id];
        quantity.innerHTML = `0`;
    } else {
        carrito[btn.dataset.id] = {...producto};
    }
    llenarCarrito();
})})
}

// Buscador

function searchFilters(input,selector){
    d.addEventListener("keyup", (e) => {
        if(e.target.matches(input)){
            // console.log(e.target.value);
    d.querySelectorAll(selector).forEach((el) => el.textContent.toLowerCase().includes(e.target.value.toLowerCase())
    ?el.classList.remove("d-none")
    :el.classList.add("d-none"));
        }
    })
}


//Sacamos comportamiento por defecto del form para evitar que recargue la página cuando damos enter

const formContent = d.querySelectorAll("#form-content");

formContent.addEventListener("submit", (e) => {
    e.preventDefault();
} )

// Checkbox filter

   const procesadores = d.querySelector(".procesador"); 
 const motherboards = d.querySelector(".motherboard"); 
 const graficas = d.querySelector(".grafica"); 
    
  procesadores.addEventListener("click", () => {
    if(procesadores.checked){
        motherboards.setAttribute("disabled","");
        graficas.setAttribute("disabled","");
        [...d.querySelectorAll(".card")].filter(procesador => !procesador.textContent.includes("procesador")).forEach((el) => el.classList.add("d-none"));
    } else {
        [...d.querySelectorAll(".card")].filter(procesador => !procesador.textContent.includes("procesador")).forEach((el) => el.classList.remove("d-none"));
        motherboards.removeAttribute("disabled","");
        graficas.removeAttribute("disabled","");
    }
 })

 motherboards.addEventListener("click", () => {
    if(motherboards.checked){
        procesadores.setAttribute("disabled","");
        graficas.setAttribute("disabled","");
        [...d.querySelectorAll(".card")].filter(motherboard => !motherboard.textContent.includes("motherboard")).forEach((el) => el.classList.add("d-none"));
    } else {
        [...d.querySelectorAll(".card")].filter(motherboard => !motherboard.textContent.includes("motherboard")).forEach((el) => el.classList.remove("d-none"));
        procesadores.removeAttribute("disabled","");
        graficas.removeAttribute("disabled","");
    }
 })


 graficas.addEventListener("click", () => {
    if(graficas.checked){
        procesadores.setAttribute("disabled","");
        motherboards.setAttribute("disabled","");
        [...d.querySelectorAll(".card")].filter(grafica => !grafica.textContent.includes("grafica")).forEach((el) => el.classList.add("d-none"));
        console.log(contenedorProductos);
    } else {
        [...d.querySelectorAll(".card")].filter(grafica => !grafica.textContent.includes("grafica")).forEach((el) => el.classList.remove("d-none"));
        procesadores.removeAttribute("disabled","");
        motherboards.removeAttribute("disabled","");
    }
 })

// Dark Mode
 
const btnSwitch = d.querySelector("#switch"); 
btnSwitch.addEventListener("click", ()=> {
    d.body.classList.toggle("dark");
    btnSwitch.classList.toggle("active");

    // Guardar en localStorage

    if(d.body.classList.contains("dark")){
        localStorage.setItem("dark-mode","true"); 
    } else {
        localStorage.setItem("dark-mode","false"); 
    }

});

if (localStorage.getItem("dark-mode") === "true") {
    d.body.classList.add("dark");
    btnSwitch.classList.add("active");
    
} else{
    d.body.classList.remove("dark");
    btnSwitch.classList.remove("active");
}
