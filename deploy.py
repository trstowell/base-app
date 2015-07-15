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

# ssh.util.log_to_file("swim.log", 10)

env.user = "root"
env.password = "wrt54g00"
env.repo = "trstowell"
env.repo_root = "/app/%s" % env.repo

env.hosts = ["trstowell.com"]

def deploy():

    with cd('/app'):
        tar_filename = "%s-%s.tar.gz" % (env.repo, get_timestamp())
        run('tar -zcvf %s %s' %  (tar_filename, env.repo))
        run('mv %s /backups' % tar_filename)
        run('rm -r %s' % env.repo)

        run('git clone http://github.com/trstowell/trstowell.git')

    run('supervisorctl -c /etc/supervisor/supervisord.conf restart gunicorn')

def full_install():
    setup_directories()

    install_git()
    clone_repo()

    setup_python()

    install_app_runners()
    start_app()

def setup_directories():
    run('mkdir -p /app')
    run('mkdir -p /app/logs')
    run('mkdir -p /app/venv')
    run('mkdir -p /backups')

def install_git():
    run('apt-get install -y git')

def clone_repo():
    with cd('/app/%s' % env.repo):
        run('git clone http://github.com/trstowell/trstowell.git') # Manually enter Git password

    with cd(env.repo_root):
        run('chmod +x *.py')

def setup_python():
    run('apt-get install -y python-dev')
    run('apt-get install -y python-pip')
    run('pip install virtualenv')
    run('virtualenv /app/venv')
    run('/app/venv/bin/pip install -r %s/requirements.txt' % env.repo_root)


def install_app_runners():
    run('apt-get install -y supervisor')

    with cd(env.repo_root):
        run('cp gunicorn.conf /etc/supervisor/conf.d')

def start_app():
    run('service supervisor restart')

def purge():
    run('rm -r /app')

    run('rm -r /var/lib/mongodb')
    run('apt-get purge -y mongodb-org')
    run('apt-get -y autoremove')

    run('apt-get purge -y git')

    run('supervisorctl stop all')
    run('rm -r /var/log/supervisor')
    run('rm -r /etc/supervisor')
    run('apt-get purge -y supervisor')


#-------- Helper functions --------#

def get_timestamp():
    """
     Returns the current date as a string
    """

    now = datetime.date.today()

    full_str = str(now.month) + "-" + str(now.day) + "-" + str(now.year)

    return full_str