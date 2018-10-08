#sudo git config --global user.email "marcelo.gagliano@gmail.com"
#sudo git config --global user.name "Marcelo Gagliano"
#git config credential.helper store
#git config --global credential.helper "cache --timeout 7200"
git add .
git commit -m "$@"
#git remote add origin https://github.com/marcelogagliano/helios.git
git remote -v
git push origin master