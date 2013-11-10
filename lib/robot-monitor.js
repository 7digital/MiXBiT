var cp = require('child_process');
var path = require('path');
var sock = require('./sock');
var robot;

function startRobot() {
	return cp.fork(path.join(__dirname, '..', 'robot.js'));
}

function listenToRobotProcessEvents(robotProcess) {
	robotProcess.on('message', function notifyClients(room) {
		sock.update(room);
	});

	robotProcess.on('error', function restartRobot() {
		robotProcess.kill();
		monitor();
	});

	return robotProcess;
}

function monitor() {
	robot = startRobot();
	listenToRobotProcessEvents(robot);
}

process.on('exit', function () {
	robot.kill();
});

module.exports = {
	monitor: monitor
};
