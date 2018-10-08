git config --global user.email "marcelo.gagliano@gmail.com"
git config --global user.name "Marcelo Gagliano"
git config credential.helper store
git push https://github.com/marcelogagliano/helios.git
git config --global credential.helper "cache --timeout 7200"