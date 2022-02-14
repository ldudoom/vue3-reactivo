class PlatziReactive {
    // Dependencias (track)
    deps = new Map();

    constructor(options) {
        this.origen = options.data();
        const self = this;

        // Destino
        this.$data = new Proxy(this.origen, {
            get(target, name) {
                //console.log(target, name);
                //if (name in target){
                if (Reflect.has(target, name)){
                    //return target[name];
                    self.track(target, name);
                    return Reflect.get(target, name);
                }
                console.warn(`La porpiedad [${name}] no existe`);
                return "";
            },
            set(target, name, value) {
                //console.log(target, name, value);
                //console.log("Modificando"); 
                Reflect.set(target, name, value);
                self.trigger(name);
            }
        });
    }

    track (target, name) {
        if( ! this.deps.has(name)){
            const effect = () => {
                document.querySelectorAll(`*[p-text=${name}]`).forEach(el => {
                    this.pText(el, target, name);
                });

                document.querySelectorAll(`*[p-model=${name}]`).forEach(el => {
                    this.pModel(el, target, name);
                });

                Array.from(document.querySelectorAll("*"))
                .filter(el => {
                    // Metemos en un array sus atributos y los recorrermos
                    return [...el.attributes].some(
                        attr => attr.name.startsWith('p-bind:') && attr.value == name
                    )
                })
                .forEach(el => {
                    //console.log(el);
                    [...el.attributes].forEach(attribute => {

                        const value = attribute.value;
                        const attr = attribute.name.split(":").pop();
                        if(name == value)
                            this.pBind(el, target, name, attr);

                    })
                });
            };
            this.deps.set(name, effect);
        }
    }

    trigger (name) {
        const effect = this.deps.get(name);
        effect();
    }

    mount() {
        document.querySelectorAll("*[p-text]").forEach(el => {
            const name = el.getAttribute("p-text");
            this.pText(el, this.$data, name);
        });

        document.querySelectorAll("*[p-model]").forEach(el => {
            const name = el.getAttribute("p-model");
            this.pModel(el, this.$data, name);
            el.addEventListener("input", () => {
                //this.$data[name] = el.value;
                Reflect.set(this.$data, name, el.value);
            })
        });

        Array.from(document.querySelectorAll("*"))
        .filter(el => {
            // Metemos en un array sus atributos y los recorrermos
            return [...el.attributes].some(
                attr => attr.name.startsWith('p-bind:')
            )
        })
        .forEach(el => {
            [...el.attributes].forEach(attribute => {

                const name = attribute.value;
                const attr = attribute.name.split(":").pop();

                this.pBind(el, this.$data, name, attr);

            })
        });
    }

    pText(el, target, name) {
        //el.innerText = target[name]
        el.innerText = Reflect.get(target, name);
    }

    pModel(el, target, name) {
        //el.value = target[name];
        el.value = Reflect.get(target, name);
    }

    pBind(el, target, name, attr) {
        Reflect.set(el, attr, Reflect.get(target, name))
    }
}

let Platzi = {
    createApp(options) {
        return new PlatziReactive(options);
    }
};