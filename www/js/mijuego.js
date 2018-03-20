var app = {
    inicio: function(){
       DIAMETRO_ojo = 56;
       DIAMETRO_pico = 60;
       DIAMETRO_hueco = 75;
       DIAMETRO_buho = 225;

       
       dificultad=1;
       velocidadX=0;
       velocidadY=0;
       puntuacion=0;
       tiempo=1;
       mover=99;
       soloUno = true;

       contarOjos =0;
       ojoEnJuego = false;
       ojosTrue = false;

       picoEnJuego = false;
       picoTrue = false;
               
       alto = document.documentElement.clientHeight;
       ancho = document.documentElement.clientWidth;

       app.vigilaSensores();
       app.iniciaJuego();
    },
       
    iniciaJuego: function(){
        function preload(){
            game.physics.startSystem(Phaser.Physics.ARCADE);

            game.stage.backgroundColor = '#afeeee';
            game.load.image('buho','assets/buho.png');
            game.load.image('ojo', 'assets/ojo.png');
            game.load.image('pico', 'assets/pico.png');
            game.load.image('picotrasp', 'assets/picotrasp.png');
            game.load.image('ojotrasp', 'assets/ojotrasp.png');
            game.load.image('hueco', 'assets/hueco.png');
            game.load.image('huecotrasp','assets/ojotrasp.png');
            game.load.audio('atrapar', 'assets/atrapar.mp3');
            game.load.audio('caer', 'assets/caer.mp3');
        }

        function create(){
            timer = game.time.events.loop(1000, app.cuentaTiempo, this);
            timerMove = game.time.events.loop(50, app.mover, this);
            scoreText = game.add.text(10, alto-70, 'Puntaje: '+ puntuacion, {fontSize: '30px', fill: '#ff8080'});
            timeText = game.add.text(10, alto-40, 'Tiempo: ' + tiempo, {fontSize:'30px', fill: '#ff8080'});

       
            x = ancho/2;
            y = (3*alto)/16;
            
            huecos = game.add.group();
            hueco = new Array(5);
            huecostrasp = game.add.group();
            huecotrasp = new Array(5);

            for (var i=0; i<hueco.length; i++){
                hueco[i] = huecos.create(app.inicioX(), app.inicioY()+DIAMETRO_buho, 'hueco'); 
                game.physics.arcade.enable(hueco[i]);
                huecotrasp[i] = huecostrasp.create(hueco[i].body.x + (0.66*(DIAMETRO_ojo/2)), hueco[i].body.y + (0.44*(DIAMETRO_ojo/2)), 'huecotrasp');
                game.physics.arcade.enable(huecotrasp[i]);
            }
           
            buho = game.add.sprite(x - (DIAMETRO_buho/2), y - (DIAMETRO_buho/2), 'buho');
            game.physics.arcade.enable(buho);

            picotrasp = game.add.sprite(x - (0.48*DIAMETRO_pico), y - (0.44*DIAMETRO_pico), 'picotrasp');
            game.physics.arcade.enable(picotrasp);

            ojodertrasp = game.add.sprite(x - (1.14*DIAMETRO_ojo), y - (0.75*DIAMETRO_ojo), 'ojotrasp');
            game.physics.arcade.enable(ojodertrasp);

            ojoizqtrasp = game.add.sprite(x + (0.66*DIAMETRO_ojo), y - (0.75*DIAMETRO_ojo), 'ojotrasp');
            game.physics.arcade.enable(ojoizqtrasp);

            picos = game.add.group(); 
            ojos = game.add.group();
            
            atrapar = game.add.sound('atrapar');
            caer = game.add.sound('caer');
        }

        function update(){
            var factorDificultad = (100 + (dificultad * 50));

            //cada 5 segundos mover los huecos             
            if (mover == 100){
               app.moverHuecos();
            }

            if (picoTrue && ojosTrue){
                app.terminar();
            }
            else { 
                //Generar un ojo o un pico para acomodar
                if (soloUno) {
                    parte = game.rnd.integerInRange(1, 2);
                    if (parte == 1 && !picoTrue){
                        pico = picos.create(ancho/2 + (0.5*DIAMETRO_pico), alto - (1.5*DIAMETRO_pico), 'pico');            
                        game.physics.arcade.enable(pico);
                        pico.body.collideWorldBounds = true;
                        soloUno = false;
                        picoEnJuego = true;
                        ojoEnJuego = false;
                    }

                    if (parte==2 && !ojosTrue){
                        ojos = game.add.group(); 
                        ojo = ojos.create(ancho/2 + (0.5*DIAMETRO_ojo) , alto - (1.5*DIAMETRO_ojo), 'ojo');            
                        game.physics.arcade.enable(ojo);
                        ojo.body.collideWorldBounds = true;
                        soloUno = false;
                        ojoEnJuego = true;
                        picoEnJuego = false;
                    }
                }

                if(picoEnJuego) {
                    game.physics.arcade.overlap(picotrasp, pico, app.pegaPico, null, this); 
                    game.physics.arcade.overlap(huecostrasp, pico, app.caerPico, null, this); 
                    game.physics.arcade.overlap(ojoizqtrasp, pico, app.caerPico, null, this);
                    game.physics.arcade.overlap(ojodertrasp, pico, app.caerPico, null, this);
                    pico.body.velocity.x = (velocidadX * (-1 * factorDificultad));
                    pico.body.velocity.y = (velocidadY * factorDificultad);
                } else {
                    game.physics.arcade.overlap(ojoizqtrasp, ojo, app.pegarOjoIzq, null, this);
                    game.physics.arcade.overlap(ojodertrasp, ojo, app.pegarOjoDer, null, this);
                    game.physics.arcade.overlap(huecostrasp, ojo, app.caerOjo, null, this);
                    game.physics.arcade.overlap(picotrasp, ojo, app.caerOjo, null, this); 
                    ojo.body.velocity.x = (velocidadX * (-1 * factorDificultad));
                    ojo.body.velocity.y = (velocidadY * factorDificultad);
                }
            }

        }

        var estados = {preload: preload, create: create, update: update};
        var game = new Phaser.Game(ancho, alto, Phaser.CANVAS, 'phaser', estados);
    },
    
    //cada que cae un pico o un ojo en un hueco se incrementa la  dificultad 
    caerPico: function(){
        dificultad+= 1;
        soloUno = true;
        pico.kill();
        caer.play();
    },

    caerOjo: function(){
        dificultad+= 1;
        soloUno = true;
        ojo.kill(); 
        caer.play();       
    },

    pegarOjoIzq: function(){
        soloUno = true;
        ojo.kill();
        ojoizqtrasp.kill();
        contarOjos++;
        if (contarOjos == 2){
            ojosTrue = true;
        }

        ojos.create(x + (0.4*DIAMETRO_ojo), y - (0.9*DIAMETRO_ojo), 'ojo');
        atrapar.play();
    },

    pegarOjoDer: function(){
        soloUno = true;
        ojo.kill();
        ojodertrasp.kill();
        contarOjos++;
        if (contarOjos == 2){
            ojosTrue = true;
        }

        ojoder = ojos.create(x - (1.3*DIAMETRO_ojo), y - (0.9*DIAMETRO_ojo), 'ojo');
        atrapar.play();
    },

    pegaPico: function(){
        soloUno = true;
        pico.kill();
        picotrasp.kill();
        picoTrue = true;
       
        picos.create(x - (0.48*DIAMETRO_pico), y - (0.44*DIAMETRO_pico), 'pico');
        atrapar.play();
    },

    inicioX: function(){
         return app.numeroAleatorioHasta(ancho - DIAMETRO_hueco);
    },

    inicioY: function(){
         return app.numeroAleatorioHasta(alto - (2*DIAMETRO_hueco)- DIAMETRO_buho);
    },

    numeroAleatorioHasta: function(limite){
         return Math.floor(Math.random() * limite); 
    },

    vigilaSensores: function(){
        function onError(){
            console.log('onError!');
        }

        function onSuccess(datosAceleracion){
            app.detectaAgitacion(datosAceleracion);
            app.registraDireccion(datosAceleracion);

        }

        navigator.accelerometer.watchAcceleration(onSuccess, onError, {frequency: 10});
    },
    
    detectaAgitacion: function(datosAceleracion){
        //Inclinar rapido hacia arriba el dispositivo para comenzar de nuevo
        posicionZ = datosAceleracion.z < 0;
        if (posicionZ){
            setTimeout(app.recomienza, 1000);
        }
    },

    recomienza: function(){
        document.location.reload(true);
    },

    registraDireccion: function(datosAceleracion){
        velocidadX = datosAceleracion.x;
        velocidadY = datosAceleracion.y;
    },

    cuentaTiempo: function(){
        //Tiempo del juego 60 segundos
        if(tiempo == 60){
            app.terminar();
        }
        tiempo++;
        timeText.setText('Tiempo: ' + tiempo);
        puntuacion = 6000 - tiempo * 100;
        scoreText.setText('Puntaje: ' + puntuacion);

    },
    
    mover: function(){
        if (mover == 100){
            mover = 1;
        }
        else {
            mover++;
        }
    },

    moverHuecos: function(){
            var mi = 0;
            do{
                traslapado = false;
                hueco[mi].body.x = app.inicioX();
                hueco[mi].body.y = (app.inicioY()+DIAMETRO_buho); 
                huecotrasp[mi].body.x = (hueco[mi].body.x + (0.66*(DIAMETRO_ojo/2))); 
                huecotrasp[mi].body.y = (hueco[mi].body.y + (0.44*(DIAMETRO_ojo/2))); 
                for (var i=0; i<mi; i++){
                    if((hueco[mi].body.y + DIAMETRO_hueco) < hueco[i].body.y || (hueco[i].body.y + DIAMETRO_hueco) < hueco[mi].body.y){
                     noTraslapado = true; 
                    }
                    else {
                        if ((hueco[mi].body.x + DIAMETRO_hueco) < hueco[i].body.x || (hueco[i].body.x + DIAMETRO_hueco) < hueco[mi].body.x){
                            noTraslapado = true;
                        }
                        else {
                            traslapado = true;
                        }
                    }
                }
                if (!traslapado){ 
                    mi++;
                } 
            }while(mi < hueco.length);
            
    },

    terminar: function(){
        game.time.events.remove(timerMove);
        game.time.events.remove(timer);
    }
        
};

if('addEventListener' in document){
    document.addEventListener('deviceready', function() {
        app.inicio();
    }, false);
}