class PlatziReactive {

    constructor(options) {
        this.origen = options.data();

        // Destino
        this.$data = new Proxy(this.origen, {
            get(target, name) {
                //console.log(target, name);
                if (name in target){
                    return target[name];
                }
                console.warn(`La porpiedad [${name}] no existe`);
                return "";
            }
        });
    }

    mount() {
        document.querySelectorAll("*[p-text]").forEach(el => {
            this.pText(el, this.$data, el.getAttribute("p-text"));
        });
    }

    pText(el, target, name) {
        console.log(target, name);
        el.innerText = target[name]
    }

    pModel() {}
}

let Platzi = {
    createApp(options) {
        return new PlatziReactive(options);
    }
};