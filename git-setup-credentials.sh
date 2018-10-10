git config --global user.email "marcelo.gagliano@gmail.com"
git config --global user.name "Marcelo Gagliano"
git config credential.helper store
git remote rm origin
git remote add origin https://github.com/marcelogagliano/helios.git
git config master.remote origin
git config master.merge refs/heads/master
#git push https://github.com/marcelogagliano/helios.git
git config --global credential.helper "cache --timeout 7200"