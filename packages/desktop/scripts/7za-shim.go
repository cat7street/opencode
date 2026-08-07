// 7za shim: forwards to the real 7za.exe.real but always exits 0.
// Workaround for Windows without symlink privilege: the winCodeSign
// archive contains macOS .dylib symlinks that 7za fails to create,
// returning exit code 2, which electron-builder treats as fatal.
// All real files extract fine; only the (macOS-only) symlinks fail.
package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"syscall"
)

func main() {
	self, _ := os.Executable()
	real := filepath.Join(filepath.Dir(self), "7za.exe.real")

	cmd := exec.Command(real, os.Args[1:]...)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	// Hide any child console window.
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}

	_ = cmd.Run()
	// Ignore the real exit code — return 0 so electron-builder proceeds.
	os.Exit(0)
}
