<script setup>
import { reactive, computed } from "vue";
import { useRoute } from "vue-router";
import { InboxOutlined, UploadOutlined } from "@ant-design/icons-vue";

import WYSIWYG from "@/components/WYSIWYG.vue";
import Course from "@/classes/course";
import { operationType } from "../../enums/appEnums";

const route = useRoute();

const currentOperation = computed(() => route.params.operation);

const title = {
  [operationType.Create]: "新增課程",
  [operationType.Edit]: "編輯課程",
};

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};

const courseState = reactive(
  new Course({
    id: computed(() => route.params.id),
    name: "",
    teacherId: "",
    teacherName: "",
    semester: "2024-1",
    credits: 3,
    category: "",
    tags: [],
    maxStudents: 100,
    currentStudents: 0,
    description: "",
    prerequisites: [],
    schedule: [],
    thumbnail: "",
    visible: true,
    status: "draft",
    submitted: false,
    approved: false,
  })
);

const onFinish = (values) => {
  console.log("Success:", values);
};
const onFinishFailed = (errorInfo) => {
  console.log("Failed:", errorInfo);
};
</script>

<template>
  <div
    class="u-h100% u-w100% u-bg-white u-m36px u-p24px u-shadow u-rounded-16px"
  >
    <h1 class="u-text-24px u-font-bold u-mb24px u-c-blue u-text-left">
      {{ title[currentOperation] }}
    </h1>
    <a-form
      :model="courseState"
      name="validate_other"
      v-bind="formItemLayout"
      @finishFailed="onFinishFailed"
      @finish="onFinish"
    >
      <!-- <a-form-item label="Plain Text">
        <span class="ant-form-text">China</span>
      </a-form-item> -->

      <a-form-item
        :name="['course', 'name']"
        label="Name"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="courseState.name" />
      </a-form-item>

      <a-form-item
        v-if="currentOperation === operationType.Edit"
        :name="['course', 'id']"
        label="ID"
      >
        <a-input v-model:value="courseState.id" disabled />
      </a-form-item>

      <a-form-item
        name="select"
        label="Select"
        has-feedback
        :rules="[{ required: true, message: 'Please select teacher!' }]"
      >
        <a-select
          v-model:value="courseState.teacherId"
          placeholder="Please select teacher"
        >
          <a-select-option value="id1">teacher1</a-select-option>
          <a-select-option value="id2">teacher2</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item
        name="select"
        label="Select"
        has-feedback
        :rules="[{ required: true, message: 'Please select course category!' }]"
      >
        <a-select
          v-model:value="courseState.category"
          placeholder="Please select course category"
        >
          <a-select-option value="lecture">Lecture</a-select-option>
          <a-select-option value="seminar">Seminar</a-select-option>
          <a-select-option value="workshop">Workshop</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item
        name="tags"
        label="Tags"
        :rules="[
          {
            required: true,
            message: 'Please select your favourite colors!',
            type: 'array',
          },
        ]"
      >
        <a-select
          v-model:value="courseState.tags"
          mode="multiple"
          placeholder="Please select course tags"
        >
          <a-select-option value="tag1">Tag 1</a-select-option>
          <a-select-option value="tag2">Tag 2</a-select-option>
          <a-select-option value="tag3">Tag 3</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Credits">
        <a-form-item name="input-number" no-style>
          <a-input-number
            v-model:value="courseState.credits"
            :min="1"
            :max="10"
          />
        </a-form-item>
        <span class="ant-form-text">credits</span>
      </a-form-item>

      <a-form-item label="Max Students">
        <a-form-item name="input-number" no-style>
          <a-input-number
            v-model:value="courseState.maxStudents"
            :min="1"
            :max="999"
          />
        </a-form-item>
        <span class="ant-form-text">students</span>
      </a-form-item>

      <!-- description -->

      <a-form-item label="Description">
        <WYSIWYG v-model:content="courseState.description" />
      </a-form-item>

      <a-form-item
        name="prerequisites"
        label="Prerequisites"
        has-feedback
        :rules="[
          { required: true, message: 'Please select course prerequisites!' },
        ]"
      >
        <a-select
          v-model:value="courseState.prerequisites"
          mode="multiple"
          placeholder="Please select course prerequisites"
        >
          <a-select-option value="prerequisite1"
            >Prerequisite 1</a-select-option
          >
          <a-select-option value="prerequisite2"
            >Prerequisite 2</a-select-option
          >
          <a-select-option value="prerequisite3"
            >Prerequisite 3</a-select-option
          >
        </a-select>
      </a-form-item>

      <a-form-item
        name="visible"
        label="Visible"
        has-feedback
        :rules="[{ required: true, message: 'Please select course visible!' }]"
      >
        <a-radio-group v-model:value="courseState.visible">
          <a-radio :value="true">Visible</a-radio>
          <a-radio :value="false">Hidden</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item
        name="status"
        label="Status"
        has-feedback
        :rules="[{ required: true, message: 'Please select course status!' }]"
      >
        <a-select
          v-model:value="courseState.status"
          placeholder="Please select course status"
        >
          <a-select-option value="draft">Draft</a-select-option>
          <a-select-option value="published">Published</a-select-option>
          <a-select-option value="closed">Closed</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Thumbnail">
        <a-form-item name="dragger" no-style>
          <a-upload-dragger
            v-model:courseState.thumbnail="courseState.thumbnail"
            name="files"
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            list-type="picture"
          >
            <p class="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p class="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p class="ant-upload-hint">Support for a single or bulk upload.</p>
          </a-upload-dragger>
        </a-form-item>
      </a-form-item>

      <!-- <a-form-item name="switch" label="Switch">
        <a-switch v-model:checked="formState.switch" />
      </a-form-item>

      <a-form-item name="slider" label="Slider">
        <a-slider
          v-model:value="formState.slider"
          :marks="{
            0: 'A',
            20: 'B',
            40: 'C',
            60: 'D',
            80: 'E',
            100: 'F',
          }"
        />
      </a-form-item>

      <a-form-item name="radio-group" label="Radio.Group">
        <a-radio-group v-model:value="formState['radio-group']">
          <a-radio value="a">item 1</a-radio>
          <a-radio value="b">item 2</a-radio>
          <a-radio value="c">item 3</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item
        name="radio-button"
        label="Radio.Button"
        :rules="[{ required: true, message: 'Please pick an item!' }]"
      >
        <a-radio-group v-model:value="formState['radio-button']">
          <a-radio-button value="a">item 1</a-radio-button>
          <a-radio-button value="b">item 2</a-radio-button>
          <a-radio-button value="c">item 3</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <a-form-item name="checkbox-group" label="Checkbox.Group">
        <a-checkbox-group v-model:value="formState['checkbox-group']">
          <a-row>
            <a-col :span="8">
              <a-checkbox value="A" style="line-height: 32px">A</a-checkbox>
            </a-col>
            <a-col :span="8">
              <a-checkbox value="B" style="line-height: 32px" disabled
                >B</a-checkbox
              >
            </a-col>
            <a-col :span="8">
              <a-checkbox value="C" style="line-height: 32px">C</a-checkbox>
            </a-col>
            <a-col :span="8">
              <a-checkbox value="D" style="line-height: 32px">D</a-checkbox>
            </a-col>
            <a-col :span="8">
              <a-checkbox value="E" style="line-height: 32px">E</a-checkbox>
            </a-col>
            <a-col :span="8">
              <a-checkbox value="F" style="line-height: 32px">F</a-checkbox>
            </a-col>
          </a-row>
        </a-checkbox-group>
      </a-form-item>

      <a-form-item name="rate" label="Rate">
        <a-rate v-model:value="formState.rate" allow-half />
      </a-form-item>

      <a-form-item label="Dragger">
        <a-form-item name="dragger" no-style>
          <a-upload-dragger
            v-model:fileList="formState.dragger"
            name="files"
            action="/upload.do"
          >
            <p class="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p class="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p class="ant-upload-hint">Support for a single or bulk upload.</p>
          </a-upload-dragger>
        </a-form-item>
      </a-form-item> -->

      <a-form-item :wrapper-col="{ span: 12, offset: 6 }">
        <a-button type="primary" html-type="submit">Submit</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
