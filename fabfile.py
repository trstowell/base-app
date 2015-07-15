#---------------------------------------------------------
# Created:      July 14, 2015
# Author:       Timothy Stowell <trstowell@gmail.com>
#
# Description:  This Fabfile is used to setup, deploy, and maintain trstowell.com
#
#---------------------------------------------------------

from fabric.api import run, env, sudo
from fabric.context_managers import cd
from fabric.network import ssh
import datetime

# ssh.util.log_to_file("base-app.log", 10)

env.user = "root"
env.password = "wrt54g00"
env.repo = "base-app"
env.repo_root = "/app/%s" % env.repo

env.hosts = ["45.55.81.255"]

def deploy():

    with cd('/app'):
        tar_filename = "%s-%s.tar.gz" % (env.repo, get_timestamp())
        run('tar -zcvf %s %s' %  (tar_filename, env.repo))
        run('mv %s /backups' % tar_filename)
        run('rm -r %s' % env.repo)

        run('git clone http://github.com/trstowell/%s.git' % env.repo)

    run('supervisorctl -c /etc/supervisor/supervisord.conf restart all')

def full_install():
    run('apt-get update')

    setup_directories()
    install_dependencies()
    clone_repo()
    setup_python()
    move_config_files()
    start()

def setup_directories():
    run('mkdir -p /app')
    run('mkdir -p /app/logs')
    run('mkdir -p /app/venv')
    run('mkdir -p /backups')

def install_dependencies():
    run('apt-get install -y supervisor')
    run('apt-get install -y nginx')
    run('apt-get install -y vim')
    run('apt-get install -y mongodb')
    run('apt-get install -y python-pip')
    run('apt-get install -y git')

    run('git config --global user.email "trstowell@gmail.com"')
    run('git config --global user.name "trstowell"')

def move_config_files():
    with cd('%s' % env.repo_root):
        run('cp gunicorn.conf /etc/supervisor/conf.d')

        run('rm /etc/nginx/sites-available/default')
        run('rm /etc/nginx/sites-enabled/default')
        run('cp nginx.conf /etc/nginx/sites-available/')
        run('ln -s /etc/nginx/sites-available/nginx.conf /etc/nginx/sites-enabled/')

def clone_repo():
    with cd('/app'):
        run('git clone http://github.com/trstowell/%s.git' % env.repo) # Manually enter Git password

def setup_python():
    run('pip install virtualenv')
    run('virtualenv /app/venv')
    run('/app/venv/bin/pip install -r %s/requirements.txt' % env.repo_root)

def start():
    run('supervisorctl -c /etc/supervisor/supervisord.conf reload')
    run('supervisorctl -c /etc/supervisor/supervisord.conf restart all')

    run('service nginx restart')

def stop():
    run('supervisorctl -c /etc/supervisor/supervisord.conf stop all')
    run('service nginx stop')


#-------- Helper functions --------#

def get_timestamp():
    """
     Returns the current date as a string
    """

    now = datetime.date.today()

    full_str = str(now.month) + "-" + str(now.day) + "-" + str(now.year)

    return full_str