const gulp = require("gulp");
const run = require("gulp-run-command").default;

gulp.task("build", run("npm run build"));

gulp.task("watch", () => {
  gulp.watch([
    "src/**/*.ts",
  ], ["build"]);
});

gulp.task("default", ["build", "watch"]);