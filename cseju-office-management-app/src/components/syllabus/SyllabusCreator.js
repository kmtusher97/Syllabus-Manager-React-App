import React, { Component } from "react";

import Appdata from "../AppData";
import Axios from "axios";
import { Table, Button } from "react-bootstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import YearMenus from "./syllabusTableComponents/YearMenus";
import SemesterMenus from "./syllabusTableComponents/SemesterMenus";

const actionButtonStyle = {
  padding: "0px",
  height: "22px",
  width: "22px"
};

class SyllabusCreator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      syllabusName: "syl1",
      syllabusXmlObj: "",
      effectiveFrom: 0,
      effectiveTo: 0,
      syllabusType: "",
      courseTypes: [],
      years: [],
      newCourse: {
        courseCode: "",
        courseTitle: "",
        courseCredit: "",
        year: "",
        semester: ""
      }
    };

    this.onchangeHandlerForAddNewCourseForm = this.onchangeHandlerForAddNewCourseForm.bind(
      this
    );
    this.addSemester = this.addSemester.bind(this);
  }

  getCourseTypes = () => {
    let courseTypesXML = this.state.syllabusXmlObj.getElementsByTagName(
      "courseType"
    );
    let tmpCourseTypes = [];
    for (let i = 0; i < courseTypesXML.length; i++) {
      tmpCourseTypes.push(courseTypesXML[i].getAttribute("name"));
    }
    this.setState({
      courseTypes: tmpCourseTypes
    });
  };

  getCourses = semesterXML => {
    let coursesXML = semesterXML.getElementsByTagName("course");
    let tmpCourses = [];
    for (let i = 0; i < coursesXML.length; i++) {
      let tmpCourse = {
        courseCode: "",
        courseTitle: "",
        courseCredit: ""
      };
      tmpCourse.courseCode = coursesXML[i].getAttribute("courseCode");
      tmpCourses.push(tmpCourse);
    }
    return tmpCourses;
  };

  getSemesters = yearXML => {
    let semestersXML = yearXML.getElementsByTagName("semester");
    let tmpSemesters = [];
    for (let i = 0; i < semestersXML.length; i++) {
      tmpSemesters.push({
        semesterId: i + 1,
        courses: this.getCourses(semestersXML[i])
      });
    }
    return tmpSemesters;
  };

  getYears = () => {
    let yearsXML = this.state.syllabusXmlObj.getElementsByTagName("year");
    let tmpYears = [];
    for (let i = 0; i < yearsXML.length; i++) {
      let tmpSemesters = this.getSemesters(yearsXML[i]);
      tmpYears.push(tmpSemesters);
    }
    this.setState({
      years: tmpYears
    });
  };

  getBasicInfo = () => {
    // this.setState({
    //   effectiveFrom: this.state.syllabusXmlObj.getElementsByTagName("")
    // });
  };

  parseXMLData = () => {
    this.getBasicInfo();
    this.getCourseTypes();
    this.getYears();
  };

  componentDidMount() {
    let url = `${Appdata.restApiBaseUrl}/syllabus/get/${this.state.syllabusName}`;

    const parser = new DOMParser();

    Axios.get(url)
      .then(response => response.data)
      .then(data => {
        this.setState({
          syllabusXmlObj: parser.parseFromString(data, "text/xml")
        });
        this.parseXMLData();
      });
  }

  /** Syllabus Table Functions */
  getNumberSuffix = num => {
    if (num % 10 === 1) return "st";
    if (num % 10 === 2) return "nd";
    if (num % 10 === 3) return "rd";
    return "th";
  };

  getSemesterRowSpan = (yearId, semesterId) => {
    return Math.max(1, this.state.years[yearId][semesterId].courses.length);
  };

  getYearRowSpan = yearId => {
    if (this.state.years[yearId].length === 0) return 1;
    let rowSpan = 0;
    for (let i = 0; i < this.state.years[yearId].length; i++) {
      rowSpan += this.getSemesterRowSpan(yearId, i);
    }
    return rowSpan;
  };

  addSemester = event => {
    let yearId = event.currentTarget.id.split("_")[1];
    let url = `${Appdata.restApiBaseUrl}/syllabus/edit/${this.state.syllabusName}/${yearId}/add/semester`;

    const parser = new DOMParser();

    Axios.get(url)
      .then(response => response.data)
      .then(data => {
        this.setState({
          syllabusXmlObj: parser.parseFromString(data, "text/xml")
        });
        this.parseXMLData();
      });
  };

  /**Add new course form */
  onchangeHandlerForAddNewCourseForm = event => {};

  render() {
    return (
      <div className="container">
        <h6>{"Edit Syllabus"}</h6>
        <div>
          <Table size="sm" bordered>
            <thead></thead>
            <tbody>
              {this.state.years.map((year, yearId) => {
                return (
                  <React.Fragment key={Math.floor(Math.random() * 1000)}>
                    <tr key={Math.floor(Math.random() * 1000)}>
                      <td rowSpan={this.getYearRowSpan(yearId)}>
                        {yearId +
                          1 +
                          this.getNumberSuffix(yearId + 1) +
                          " Year "}
                        <YearMenus
                          yearData={{ yearId: yearId + 1 }}
                          addSemester={this.addSemester}
                        />
                      </td>

                      {year.length > 0 ? (
                        <td rowSpan={this.getSemesterRowSpan(yearId, 0)}>
                          {1 + this.getNumberSuffix(1) + " Semester "}
                          <SemesterMenus />
                        </td>
                      ) : null}

                      {year.length > 0 && year[0].courses.length > 0 ? (
                        <React.Fragment key={Math.floor(Math.random() * 1000)}>
                          <td>{year[0].courses[0].courseCode}</td>
                          <td>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              style={actionButtonStyle}
                            >
                              <span>
                                <FontAwesomeIcon icon={faPen} />
                              </span>
                            </Button>
                          </td>
                          <td>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              style={actionButtonStyle}
                            >
                              <span>
                                <FontAwesomeIcon icon={faTrashAlt} />
                              </span>
                            </Button>
                          </td>
                        </React.Fragment>
                      ) : null}
                    </tr>

                    {year.length > 0 && year[0].courses.length > 1
                      ? year[0].courses.map((course, courseIdx) =>
                          courseIdx > 0 ? (
                            <tr key={Math.floor(Math.random() * 1000)}>
                              <td>{course.courseCode}</td>
                              <td>
                                <Button
                                  size="sm"
                                  variant="outline-secondary"
                                  style={actionButtonStyle}
                                >
                                  <span>
                                    <FontAwesomeIcon icon={faPen} />
                                  </span>
                                </Button>
                              </td>
                              <td>
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  style={actionButtonStyle}
                                >
                                  <span>
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                  </span>
                                </Button>
                              </td>
                            </tr>
                          ) : null
                        )
                      : null}

                    {year.length > 1
                      ? year.map((semester, semesterIdx) =>
                          semesterIdx > 0 ? (
                            <React.Fragment
                              key={Math.floor(Math.random() * 1000)}
                            >
                              <tr key={Math.floor(Math.random() * 1000)}>
                                <td
                                  rowSpan={Math.max(1, semester.courses.length)}
                                >
                                  {semesterIdx +
                                    1 +
                                    this.getNumberSuffix(semesterIdx + 1) +
                                    " Semester "}
                                  <SemesterMenus />
                                </td>
                                {semester.courses.length > 0 ? (
                                  <React.Fragment
                                    key={Math.floor(Math.random() * 1000)}
                                  >
                                    <td>{semester.courses[0].courseCode}</td>
                                    <td>
                                      <Button
                                        size="sm"
                                        variant="outline-secondary"
                                        style={actionButtonStyle}
                                      >
                                        <span>
                                          <FontAwesomeIcon icon={faPen} />
                                        </span>
                                      </Button>
                                    </td>
                                    <td>
                                      <Button
                                        size="sm"
                                        variant="outline-danger"
                                        style={actionButtonStyle}
                                      >
                                        <span>
                                          <FontAwesomeIcon icon={faTrashAlt} />
                                        </span>
                                      </Button>
                                    </td>
                                  </React.Fragment>
                                ) : null}
                              </tr>
                              {semester.courses.length > 1
                                ? semester.courses.map((course, courseIdx) =>
                                    courseIdx > 0 ? (
                                      <tr
                                        key={Math.floor(Math.random() * 1000)}
                                      >
                                        <td>{course.courseCode}</td>
                                        <td>
                                          <Button
                                            size="sm"
                                            variant="outline-secondary"
                                            style={actionButtonStyle}
                                          >
                                            <span>
                                              <FontAwesomeIcon icon={faPen} />
                                            </span>
                                          </Button>
                                        </td>
                                        <td>
                                          <Button
                                            size="sm"
                                            variant="outline-danger"
                                            style={actionButtonStyle}
                                          >
                                            <span>
                                              <FontAwesomeIcon
                                                icon={faTrashAlt}
                                              />
                                            </span>
                                          </Button>
                                        </td>
                                      </tr>
                                    ) : null
                                  )
                                : null}
                            </React.Fragment>
                          ) : null
                        )
                      : null}
                  </React.Fragment>
                );
              })}
            </tbody>
          </Table>
        </div>
        <div className="container"></div>
      </div>
    );
  }
}

export default SyllabusCreator;